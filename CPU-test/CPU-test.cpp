#include <cmath>
#include <complex>
#include <cstdint>
#include <random>

namespace CPUTest {

/**
 * Using xoshiro128++ from David Blackman and Sebastiano Vigna; licence CC0
 * This should be pretty fast; quality is not very important: the CPU is doing
 * useless work anyway.
 */
class Random {
private:
  uint32_t state[4];

  static constexpr float FLOAT_BASE = 1.0f / (UINT32_C(1) << 24);

  static uint32_t rotl(const uint32_t x, int k) {
    return (x << k) | (x >> (32 - k));
  }

public:
  Random() {
    std::random_device rd{};
    state[0] = rd();
    state[1] = rd();
    state[2] = rd();
    state[3] = rd();
  }

  uint32_t next32Bits() {
    const uint32_t result = rotl(state[0] + state[3], 7) + state[0];

    const uint32_t tmp = state[1] << 9;

    state[2] ^= state[0];
    state[3] ^= state[1];
    state[1] ^= state[2];
    state[0] ^= state[3];

    state[2] ^= tmp;

    state[3] = rotl(state[3], 11);

    return result;
  }

  float nextFloat() {
    // Same as
    // https://github.com/openjdk/jdk11u/blob/master/src/java.base/share/classes/java/util/concurrent/ThreadLocalRandom.java
    // Unlike integers: float representations aren't equally distributed.
    // Therefore, this must ensure equal distribution of ranges, not bit
    // patterns.
    return (next32Bits() >> 8) * FLOAT_BASE;
  }
};

static Random rndGen{};

// The stress test turns
using CNumber = std::complex<float>;
using namespace std::complex_literals;

// Radius 2; 45° angle
static const float startingCoordinate = std::sqrt(2.f);
// 45° angle in radians
static const float radian45 = 1.f / std::sqrt(2.f);

class alignas(1024) StressTest {
private:
  // 512 KiB
  static constexpr uint32_t dataSize = 65536;

  CNumber testData[dataSize];

  // Random angle between 0° and 45°
  static float nextAngle() { return rndGen.nextFloat() * radian45; }

  static CNumber swapRealImag(CNumber input) {
    const auto realPart = input.real();
    input.real(input.imag());
    input.imag(realPart);
    return input;
  }

  static CNumber approximateExp(CNumber input) { return std::exp(input); }

  static CNumber randomlyRotate(CNumber input) {
    // Euler's formula: rotate z by x degree -> z * e^ix
    const auto iTheta = 1if * nextAngle();
    return input * approximateExp(iTheta);
  }

public:
  StressTest() {
    for (uint32_t i = 0; i < dataSize; i++) {
      testData[i].real(startingCoordinate);
      testData[i].imag(startingCoordinate);
    }
  }

  void runOneInteration() {
    for (uint32_t i = 0; i < dataSize; i += 2) {
      // Swap first with second element, mirror the point using iy=x as mirror
      // axis. In SIMD, 128 bit width, 4 floats: shuffle 1234 -> 4321
      auto first = swapRealImag(testData[i + 1]);
      auto second = swapRealImag(testData[i]);

      testData[i] = randomlyRotate(first);
      testData[i + 1] = randomlyRotate(second);
    }
  }

  float createDataDependency() {
    float result = 0.f;
    for (uint32_t i = 0; i < dataSize; i++) {
      result += testData[i].real();
      result += testData[i].imag();
    }
    return result;
  }
};

static StressTest stressTest{};

} // namespace CPUTest

extern "C" {

float runTest(uint32_t iterationCount) {
  for (uint64_t i = 0; i < iterationCount * UINT64_C(1024); i++) {
    CPUTest::stressTest.runOneInteration();
  }
  return CPUTest::stressTest.createDataDependency();
}
}