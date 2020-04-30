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
};

static Random rndGen{};

// The stress test turns
using Point = std::complex<float>;
using namespace std::complex_literals;

class alignas(1024) StressTest {
private:
  // 45° starting angle
  static const float startingCoordinate = std::sqrtf(2.f);
  // 512 KiB
  static constexpr uint32_t dataSize = 65536;

  Point testData[dataSize];

public:
  StressTest() {
    for (uint32_t i = 0; i < dataSize; i++) {
      testData[i].real(startingCoordinate);
      testData[i].imag(startingCoordinate);
    }
  }

  void runOneInteration() {
    // TODO
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

extern "C" {

float runTest(uint32_t iterationCount) {
  for (uint64_t i = 0; i < iterationCount * UINT64_C(1024); i++) {
    stressTest.runOneInteration();
  }
  return stressTest.createDataDependency();
}
}

} // namespace CPUTest
