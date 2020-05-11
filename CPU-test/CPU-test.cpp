#include <array>
#include <cmath>
#include <complex>
#include <cstdint>
#include <cstring>
#include <numeric>
#include <random>

namespace CPUTest {

static std::random_device entropyGen{};

/**
 * Using xoroshiro128++ from David Blackman and Sebastiano Vigna; licence CC0
 * This should be pretty fast; quality is not very important: the CPU is doing
 * useless work as a pure stress test.
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

/**
 * Originally the idea is to have a small pool of rndGen, maybe 2 or 4, and give
 * each loop iteration a different rndGen than the previous loop. I had hoped
 * that an OoO CPU would take advantage of the independent data streams and
 * calculate faster. Looking at perf stat result, it turns out that one single
 * rndGen is significantly faster, even though it introduces data dependency
 * between two subsequent loop iterations. I suspect that the data load and
 * store is too costly, even though it's all hot data. With only one rndGen, the
 * entire state of rndGen can be kept in registers and never do any loads and
 * stores to rndGen during the main stress test.
 */
static constexpr auto poolSize = 0b1;
// static constexpr uint32_t rndGenSelectorMask = 0b111;
static std::array<FastRand, poolSize> rndGenPool{FastRand{}};

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

    /*return CNumber{std::cos(rotationAngle), std::sin(rotationAngle)};*/

    // Calculating the result using std::exp or the trigonometric functions is
    // too slow. "On paper" (counting operations) continued fractions may be
    // faster than the taylor series. However, it seems that it'll involve
    // complex number divisions. I'm not sure if that can be avoided. (I also
    // don't know how to implement it as code, the taylor series can be
    // translated one to one to C++.) Stopping at x^5 is good enough for the
    // stress test that uses small angles. The follwing simplification also
    // avoids any divisions.

    // simplify (WolframAlpha):
    // 1 + i x + 1/2 (i x)^2 + 1/6 (i x)^3 + 1/24 (i x)^4 + 1/120 (i x)^5
    // assuming x is real:
    // 1/24 (x^4 - 12 x^2 + 24) + i (x^5/120 - x^3/6 + x)
    const auto xPow1 = rotationAngle;
    const auto xPow2 = rotationAngle * rotationAngle;
    const auto xPow3 = xPow2 * rotationAngle;
    const auto xPow4 = xPow2 * xPow2;
    const auto xPow5 = xPow4 * rotationAngle;
    const auto realPart = (1.0 / 24.0) * (xPow4 - 12.0 * xPow2 + 24.0);
    const auto imagPart = (1.0 / 120.0) * xPow5 - (1.0 / 6.0) * xPow3 + xPow1;
    return CNumber{realPart, imagPart};
  }

  static CNumber randomFlipSign(FastRand &rndGen, CNumber input) {
    // Randomly flip the sign of the real and imag part. Since the length
    // doesn't change, the resulting point is still part of the circle with
    // radius 2.
    static constexpr auto HIGHEST_BIT = (UINT64_C(1) << 63);
    const auto realMask = rndGen.next_64() & HIGHEST_BIT;
    const auto imagMask = rndGen.next_64() & HIGHEST_BIT;

    auto real = input.real();
    auto imag = input.imag();
    uint64_t realAsInt{};
    uint64_t imagAsInt{};

    // Apparently this is the only standard conforming way of type punning.
    std::memcpy(&realAsInt, &real, sizeof(uint64_t));
    std::memcpy(&imagAsInt, &imag, sizeof(uint64_t));
    realAsInt = realAsInt ^ realMask;
    imagAsInt = imagAsInt ^ imagMask;
    std::memcpy(&real, &realAsInt, sizeof(uint64_t));
    std::memcpy(&imag, &imagAsInt, sizeof(uint64_t));

    return CNumber{real, imag};
  }

  static CNumber processElement(FastRand &rndGen, CNumber input) {
    // Randomly rotate 0-45° counterclockwise
    const auto rotationAngle = nextAngle(rndGen);
    const auto transformationMultiplier =
        transformationMultiplierForRotation(rotationAngle);
    const auto rotatedResult = input * transformationMultiplier;
    return randomFlipSign(rndGen, rotatedResult);
  }

  // Fast method to guarantee that the optimizer won't remove the main loop
  double createDataDependency() {
    const auto result =
        std::accumulate(testData.cbegin(), testData.cend(), CNumber{});
    return result.real() + result.imag();
  }

public:
  StressTest() { testData.fill(initialValue); }

  double runTest() {
    // This loop count will result in a few seconds of run time. I would imagine
    // that even on ARM A55 CPU cores it won't take more than 20 seconds.
    static constexpr auto iterCount = 4 * 1024;
    static constexpr auto loopCount = iterCount / 2;
    auto &rndGen = rndGenPool[0];
    for (auto i = 0; i < loopCount; i++) {

      for (uint32_t i = 0; i < testData.size(); i++) {

        testData[i] = processElement(rndGen, testData[i]);
      }
      // This reverse loop guarantees that each accessed element is right next
      // to the previous element. While perf stat do report lower LLC loads and
      // load misses, it doesn't seem to change the run time by that much. I
      // imagine that this could potentially help low power in-order cores with
      // small caches. There, it could reduce wasted cycles due to pipeline
      // stalls in case of cache misses.
      for (int32_t i = testData.size() - 1; i >= 0; i--) {

        testData[i] = processElement(rndGen, testData[i]);
      }
    }
    return createDataDependency();
  }

  void reset() { testData.fill(initialValue); }
};

static StressTest stressTest{};

} // namespace CPUTest

extern "C" {
double runTest() {
  CPUTest::stressTest.reset();
  return CPUTest::stressTest.runTest();
}
}