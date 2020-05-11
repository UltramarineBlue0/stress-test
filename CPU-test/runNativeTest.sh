#!/bin/bash -eux

g++-8 -std=c++17 -Wall -Wextra -Wpedantic -g3 -Ofast -march=nehalem -mtune=skylake -flto -fuse-linker-plugin -fno-omit-frame-pointer -o test.out ./CPU-test.cpp ./main.cpp -lm

sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out

eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test1.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test2.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test3.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test4.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test5.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test6.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test7.txt &"
eval "nohup sudo perf stat -r 3 --scale -d -d -d -B -D 9 -- chrt -b 0 nice -n -2 ./test.out &> ./test8.txt &"

# sudo perf record -F 397 --call-graph fp -D 9 -- chrt -b 0 nice -n -2 ./test.out && sudo chmod +r ./perf.data
# perf report -M intel --children --call-graph 'graph,caller'