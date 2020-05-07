#include <array>
#include <cmath>
#include <complex>
#include <cstdint>
#include <numeric>
#include <random>

namespace CPUTest {

/**
 * Using xoroshiro128++ from David Blackman and Sebastiano Vigna; licence CC0
 * This should be pretty fast; quality is not very important: the CPU is doing
 * useless work as a pure stress test.
 */
class Random {
private:
  static uint64_t rotl(const uint64_t x, int k) {
    return (x << k) | (x >> (64 - k));
  }

  uint64_t s[2]{};

public:
  Random() {
    std::random_device rd{};
    s[0] = rd();
    s[1] = rd();
  }

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
    static constexpr double DOUBLE_BASE = 1.0 / (UINT64_C(1) << 53);
    return (next_64() >> 11) * DOUBLE_BASE;
  }
};

static Random rndGen{};

// The stress test turns

static constexpr uint32_t align1K = 1024;
// 45° angle in radians
static constexpr double radian45 =
    0.78539816339744830961566084581987572104929234984377645524373614807695410157155224965700870633552926699553702162832;
// Radius 2; 45° angle
static constexpr double startingCoordinate = radian45 * 2.0;

using CNumber = std::complex<double>;
using namespace std::complex_literals;

class alignas(align1K) StressTest {
private:
  // 768 KiB
  static constexpr int32_t arraySize = (512 + 256) * 1024;
  static constexpr int32_t elemCount = arraySize / (8 * 2);

  alignas(align1K) std::array<CNumber, elemCount> testData{};

  // Random angle between 0° and 45°
  static double nextAngle() { return rndGen.nextDouble() * radian45; }

  static CNumber transformationMultiplierForRotation(double rotationAngle) {
    // Euler's formula: rotate z by x degree -> z * (cos(x) + i * sin(x))
    // = z * e^ix
    /*CNumber result{std::cos(rotationAngle), std::sin(rotationAngle)};
    return result;*/
    CNumber ix{0.0, rotationAngle};
    return std::exp(ix);
  }

  static CNumber processElement(CNumber input) {
    // Randomly rotate 0-45° counterclockwise
    const CNumber transformationMultiplier =
        transformationMultiplierForRotation(nextAngle());
    return input * transformationMultiplier;
  }

public:
  StressTest() {
    const CNumber initialValue{startingCoordinate, startingCoordinate};
    testData.fill(initialValue);
  }

  double createDataDependency() {
    CNumber start{};
    auto result = std::accumulate(testData.cbegin(), testData.cend(), start);
    return result.real() + result.imag();
  }

  double runTest(int32_t testDuration) {
    const int32_t iterCount = 128 * testDuration;
    const int32_t loopCount = iterCount / 2;
    for (int32_t i = 0; i < loopCount; i++) {

      for (uint32_t i = 0; i < testData.size(); i++) {
        testData[i] = processElement(testData[i]);
      }

      for (int32_t i = testData.size() - 1; i >= 0; i--) {
        testData[i] = processElement(testData[i]);
      }
    }
    return createDataDependency();
  }
};

static StressTest stressTest{};

} // namespace CPUTest

extern "C" {
double runTest(int32_t testDuration) {
  return CPUTest::stressTest.runTest(testDuration);
}
}