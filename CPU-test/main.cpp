#include <chrono>
#include <iostream>

extern "C" double runTest();

int main() {

  for (auto i = 0; i < 9; i++) {
    const auto start = std::chrono::steady_clock::now();
    const auto result = runTest();
    const auto stop = std::chrono::steady_clock::now();

    const std::chrono::duration<double> duration = stop - start;

    std::cout << "Duration: " << duration.count() << " s\n" << result << '\n';
  }
}