#include <array>
#include <cmath>
#include <complex>
#include <cstdint>
#include <cstring>
#include <random>
#include <type_traits>
#include <vector>

namespace CPUTest {

// Performance of random_device is platform dependent. Since multiple FastRand
// are created for each test run, random_device could have an unexpectedly high
// influence on the test. So I'm not using it directly to seed FastRand.
static std::random_device rd{};
static std::mt19937_64 entropyGen{rd()};

/**
 * Using xoroshiro128++ from David Blackman and Sebastiano Vigna; licence CC0
 * This should be very fast while being very small; quality is not very
 * important: the CPU is doing useless work as a pure stress test.
 */
class FastRand {
private:
  static uint64_t rotl(const uint64_t x, int k) {
    return (x << k) | (x >> (64 - k));
  }

  std::array<uint64_t, 2> s{};

public:
  FastRand() : s{entropyGen(), entropyGen()} {}

  uint64_t next_64() {
    const uint64_t s0 = s[0];
    uint64_t s1 = s[1];
    const uint64_t result = rotl(s0 + s1, 17) + s0;

    s1 ^= s0;
    s[0] = rotl(s0, 49) ^ s1 ^ (s1 << 21); // a, b
    s[1] = rotl(s1, 28);                   // c

    return result;
  }

  double nextDouble() {
    // Same as
    // https://github.com/openjdk/jdk11u/blob/master/src/java.base/share/classes/java/util/concurrent/ThreadLocalRandom.java
    // Unlike integers: float representations aren't equally distributed.
    // Therefore, this must ensure equal distribution of ranges, not bit
    // patterns.
    static constexpr auto DOUBLE_BASE = 1.0 / (UINT64_C(1) << 53);
    return (next_64() >> 11) * DOUBLE_BASE;
  }

  bool nextBool() { return next_64() >> 63; }

  // Move only type. Prevent accidental cloning: the algorithm should modify the
  // original generator instead of a copy of it.
  ~FastRand() = default;
  FastRand(const FastRand &rnd) = delete;
  FastRand &operator=(const FastRand &rnd) = delete;
  FastRand(FastRand &&rnd) = default;
  FastRand &operator=(FastRand &&rnd) = default;
};

static_assert(!std::is_copy_constructible<FastRand>::value);
static_assert(!std::is_copy_assignable<FastRand>::value);
static_assert(std::is_move_constructible<FastRand>::value);
static_assert(std::is_move_assignable<FastRand>::value);

/**
 * The stress test turns complex numbers in a circle in the complex number
 * plane. This avoids infinities and NaNs, since the radius stays the same, only
 * the angle changes. It also reduces the chance of subnormal floats, which is
 * slow on current CPUs. Even if one of the coordinate is close to zero, it'll
 * move away in the next loop, since its angle will change.
 *
 * The random sign flip is here to fill out the integer execution units. For
 * more notes see README.md.
 */

static constexpr auto align1K = 1024;

using CNumber = std::complex<double>;

class alignas(align1K) StressTest {
private:
  // 45° angle in radians
  static constexpr auto radian45 =
      0.78539816339744830961566084581987572104929234984377645524373614807695410157155225;
  // Polar coord: radius 2; 45° angle
  static constexpr auto startingCoordinate =
      1.41421356237309504880168872420969807856967187537694807317667973799073247846210704;
  static constexpr CNumber initialValue{startingCoordinate, startingCoordinate};

  // 768 KiB
  static constexpr auto arraySize = (512 + 256) * 1024;
  // Each element consists of two doubles
  static constexpr auto elemCount = arraySize / (8 * 2);

  alignas(align1K) std::array<CNumber, elemCount> testData{};

  // Random angle between 0° and 45°
  static double nextAngle(FastRand &rndGen) {
    return rndGen.nextDouble() * radian45;
  }

  static CNumber transformationMultiplierForRotation(double rotationAngle) {
    // Euler's formula: rotate z by x degree
    // -> z * (cos(x) + i * sin(x)) = z * e^ix

    // return CNumber{std::cos(rotationAngle), std::sin(rotationAngle)};
    // return std::exp(CNumber{0, rotationAngle});

    // Calculating the result using std::exp or the trigonometric functions is
    // too slow. "On paper" (counting operations) continued fractions may be
    // faster than the taylor series. However, it seems that it'll involve
    // complex number divisions. I'm not sure if that can be avoided. (I also
    // don't know how to implement it as code, the taylor series can be
    // translated one to one to C++.) Stopping at x^5 is good enough for the
    // stress test that uses small angles and limited iteration count. The
    // follwing simplification also avoids any floating point divisions.

    // simplify (WolframAlpha):
    // 1 + i x + 1/2 (i x)^2 + 1/6 (i x)^3 + 1/24 (i x)^4 + 1/120 (i x)^5
    // assuming x is real:
    // 1/24 (x^4 - 12 x^2 + 24) + i (x^5/120 - x^3/6 + x)
    const auto xPow1 = rotationAngle;
    const auto xPow2 = rotationAngle * rotationAngle;
    const auto xPow3 = xPow2 * rotationAngle;
    const auto xPow4 = xPow2 * xPow2;
    const auto xPow5 = xPow4 * rotationAngle;
    const auto realPart = 1.0 - (1.0 / 2.0) * xPow2 + (1.0 / 24.0) * xPow4;
    const auto imagPart = xPow1 - (1.0 / 6.0) * xPow3 + (1.0 / 120.0) * xPow5;
    return CNumber{realPart, imagPart};
  }

  static CNumber randomlyFlip(FastRand &rndGen, CNumber input) {
    static_assert(sizeof(uint64_t) == sizeof(CNumber::value_type));
    // Randomly flip the sign of the imag part and swap real with imag. Since
    // the length doesn't change, the resulting point is still part of the
    // circle with radius 2. If the sign is flipped, it's a 90° counterclockwise
    // rotation, if not, it's a mirror on the y=x axis.
    static constexpr auto HIGHEST_BIT = (UINT64_C(1) << 63);
    const auto imagMask = rndGen.next_64() & HIGHEST_BIT;

    auto imag = input.imag();
    uint64_t imagAsInt{};

    // Apparently this is the only standard conforming way of type punning.
    std::memcpy(&imagAsInt, &imag, sizeof(uint64_t));
    imagAsInt = imagAsInt ^ imagMask;
    std::memcpy(&imag, &imagAsInt, sizeof(uint64_t));

    return CNumber{imag, input.real()};
  }

  static CNumber multiply(CNumber first, CNumber second) {
    // The multiply operator in stdlib takes special care of infinity and NaNs.
    // That introduces a lot of branches. "-Ofast" eliminates those cases by
    // assuming that floats are never infinite or NaN. However emscripten
    // doesn't seem to accept "-Ofast" and I don't know if llvm-opts does what I
    // assume it does.
    // https://mathworld.wolfram.com/ComplexMultiplication.html
    const auto aTimesC = first.real() * second.real();
    const auto bTimesD = first.imag() * second.imag();
    const auto aTimesD = first.real() * second.imag();
    const auto bTimesC = first.imag() * second.real();

    return CNumber{aTimesC - bTimesD, aTimesD + bTimesC};
  }

  static CNumber processElement(FastRand &rndGen, CNumber input) {
    // Randomly rotate 0-45° counterclockwise
    const auto rotationAngle = nextAngle(rndGen);
    const auto transformationMultiplier =
        transformationMultiplierForRotation(rotationAngle);
    const auto rotatedResult = multiply(input, transformationMultiplier);
    return randomlyFlip(rndGen, rotatedResult);
  }

public:
  StressTest() { testData.fill(initialValue); }

  double runTest() {
    static_assert((elemCount % 2) == 0);
    // This loop count will result in a few seconds of run time. I would imagine
    // that even on ARM A55 CPU cores it won't take more than 20 seconds.
    static constexpr auto iterCount = (4 + 2) * 1024;
    static constexpr auto loopCount = iterCount / 2;

    /**
     * Originally the idea is to have a small pool of rndGen, maybe 2 or 4, and
     * give each loop iteration a different rndGen than the previous loop. I had
     * hoped that an OoO CPU would take advantage of the independent data
     * streams and calculate faster. However the test result shows that it's
     * only slightly but consistently faster. Perhaps I underestimated modern
     * high performance microarchitectures, nevertheless i'll keep this in.
     *
     * Additionally, looking at Godbolt output, it seems that the rndGens must
     * be local to the function for the Clang to "fold" the fields of rndGen
     * into int registers. GCC is a bit better, these could also be private
     * members. They can't be globals or in arrays, in those cases, the compiler
     * will generate loads and stores which will make the test significantly
     * slower. (Even though it's hot data, not sure why it would be so slow. Is
     * it overwhelming the cache/memory subsystem? I can't imagine that it
     * does.)
     */
    FastRand rndGen{};
    FastRand rndGen2{};

    for (auto i = 0; i < loopCount; i++) {

      for (uint32_t i = 0; i < testData.size(); i += 2) {
        testData[i] = processElement(rndGen, testData[i]);
        testData[i + 1] = processElement(rndGen2, testData[i + 1]);
      }
      // This reverse loop guarantees that each accessed element is right next
      // to the previous element. While perf stat do report lower LLC loads and
      // load misses, it doesn't seem to change the run time by that much. I
      // imagine that this could potentially help low power in-order cores with
      // small caches. There, it could reduce wasted cycles due to pipeline
      // stalls in case of cache misses.
      for (int32_t i = testData.size() - 1; i >= 0; i -= 2) {
        testData[i] = processElement(rndGen, testData[i]);
        testData[i - 1] = processElement(rndGen2, testData[i - 1]);
      }
    }

    // Quick way to guarantee that the optimizer can't remove the main loop.
    // Bias doesn't matter here. Just that it's possible to select any element
    // in the array
    const auto index = rndGen.next_64() % elemCount;
    return testData[0].imag() + testData[index].real();
  }

  void reset() { testData.fill(initialValue); }

  void copyTestData(std::vector<CNumber> &copyTarget) const {
    copyTarget.clear();
    copyTarget.reserve(testData.size());
    copyTarget.assign(testData.cbegin(), testData.cend());
  }
};

/**
 * According to perf stat, a local variable in the test function will
 * significantly reduce the L1 dcache loads compared to a global. As expected it
 * reduced the run time in multi threaded test when all logical cores are
 * saturated. Interestingly it slightly increased single thread run time, not
 * really sure why, since other metrics stayed mostly the same.
 */
// static StressTest stressTest{};

} // namespace CPUTest

// wasm stress test
extern "C" double runTest() {
  CPUTest::StressTest stressTest{};
  return stressTest.runTest();
}

// local native stress test
void runLocalTest(std::vector<CPUTest::CNumber> &testResults) {
  CPUTest::StressTest stressTest{};
  stressTest.runTest();
  stressTest.copyTestData(testResults);
}