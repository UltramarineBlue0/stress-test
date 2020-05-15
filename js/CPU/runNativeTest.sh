#!/bin/bash -eux

g++-8 -std=c++17 -Wall -Wextra -pedantic -g3 -Ofast -march=nehalem -mtune=skylake -flto -fuse-linker-plugin -o test.out ./CPU-test.cpp ./main.cpp -lm

sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out

: <<'multi_line_comment'
Uncomment to run test that saturates 8 logical cores.
multi_line_comment
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test1.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test2.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test3.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test4.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test5.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test6.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test7.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test8.txt &"


: <<'multi_line_comment'
Record and show a profile of the test with these commands

sudo perf record -F 397 --call-graph dwarf -D 9 -- chrt -b 0 nice -n -2 ./test.out && sudo chmod +r ./perf.data
perf report -M intel --children --call-graph 'graph,caller'
multi_line_comment
