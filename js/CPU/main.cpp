#include <algorithm>
#include <cfloat>
#include <chrono>
#include <cmath>
#include <complex>
#include <iostream>
#include <numeric>
#include <vector>

extern "C" double runTest();
void runLocalTest(std::vector<std::complex<double>> &testResults);

void printStats(const std::vector<std::complex<double>> &testResults) {
  static constexpr auto radianToDegree =
      57.295779513082320876798154814105170332405472466564321549160243861202847148321553;
  double absMin{DBL_MAX};
  double absMax{-DBL_MAX};
  long double absTotal{0};
  long double argTotal{0};
  int zeroAndSubNormals{0};

  for (const auto &elem : testResults) {
    const auto acceptableValue =
        std::isfinite(elem.real()) && std::isfinite(elem.imag());
    if (!acceptableValue) {
      std::cerr << "Inf / NaN found. Aborting\n";
      throw 1;
    }
    if (!std::isnormal(elem.real())) {
      zeroAndSubNormals++;
    }
    if (!std::isnormal(elem.imag())) {
      zeroAndSubNormals++;
    }

    const auto abs = std::abs(elem);
    const auto arg = std::arg(elem);
    absMin = std::fmin(abs, absMin);
    absMax = std::fmax(abs, absMax);
    absTotal += abs;
    argTotal += arg;
  }

  std::cout << "Minimum length: " << absMin << "\nMaximum length: " << absMax
            << "\nAverage length: " << (absTotal / testResults.size())
            << "\nAverage angle: "
            << (argTotal / testResults.size() * radianToDegree)
            << "\nZero or subnormal components: " << zeroAndSubNormals << '\n';
}

int main() {
  std::vector<std::complex<double>> testResults{};
  std::vector<std::chrono::duration<double>> testDuration{};

  for (auto i = 0; i < 9; i++) {
    const auto start = std::chrono::steady_clock::now();
    // runLocalTest(testResults);
    const auto testResult = runTest();
    const auto stop = std::chrono::steady_clock::now();

    const std::chrono::duration<double> duration = stop - start;
    testDuration.push_back(duration);
    std::cout << "Duration: " << duration.count() << " s\n";

    // Uncomment for stats
    // printStats(testResults);
    // Force observe the test result:
    // https://gcc.gnu.org/onlinedocs/gcc/Extended-Asm.html
    // __asm__ volatile("" : : "g"(testResults.data()));
    __asm__ volatile("" : : "g"(testResult));
  }

  std::sort(testDuration.begin(), testDuration.end());
  const auto sum = std::accumulate(testDuration.cbegin(), testDuration.cend(),
                                   std::chrono::duration<double>{0});
  std::cout << "Mean duration: " << (sum / testDuration.size()).count()
            << "\nMedian duration: "
            << (testDuration[testDuration.size() / 2]).count() << '\n';
}