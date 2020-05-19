// Firefox currently doesn't support modules in web workers yet, so
// emscripten is compiling to non module code. Relying on rollup+terser
// to remove all other module imports.
importScripts("WasmTest.js");

import { START_TEST, TEST_STOPPED, TEST_RUNNING, STOP_TEST, WORKER_READY } from "./CPU-test-event.js";
import { queueTask, cancelTask } from "../common/utils.js";
import { SlidingWindowScoring } from "../common/score.js";

class CPUTestScore extends SlidingWindowScoring {
	constructor() {
		super(3);
	}

	static newInitialValue() {
		return {
			duration: 0,
			iteration: 0,
		};
	}

	static accumulate(accumulator, currentElement) {
		accumulator.duration += currentElement.score.duration;
		accumulator.iteration++;
		return accumulator;
	}

	getNewScore(loopStartTime, loopEndTime) {
		// In minutes
		const loopDuration = (loopEndTime - loopStartTime) / 1000 / 60;
		this.addScore({ duration: loopDuration }, loopEndTime);
		const score = this.calculateScore(loopEndTime);
		// Score is loops per minute in the last 3 minutes
		return score.iteration / score.duration;
	}
}

self.Module().then(WasmTest => {

	let testStatus = TEST_STOPPED;
	let testTaskId = undefined;
	let testScoring = new CPUTestScore();

	const testFunction = () => {
		if (testStatus === TEST_RUNNING) {
			const startTime = performance.now();
			const result = WasmTest._runTest();
			const endTime = performance.now();
			const score = testScoring.getNewScore(startTime, endTime);
			testTaskId = queueTask(testFunction);
			postMessage({
				state: testStatus,
				score: score,
				// It's highly unlikely that any compiler will optimize across thread boundaries.
				// This guarantees that the test won't be optimized away by a future compiler
				// that can optimize across JS/WASM boundary.
				result: result,
			});
		}
	};

	self.addEventListener("message", e => {
		if ((e.data === START_TEST) && testStatus !== TEST_RUNNING) {
			testStatus = TEST_RUNNING;
			testScoring = new CPUTestScore();
			testTaskId = queueTask(testFunction);
		}
		if ((e.data === STOP_TEST) && testStatus === TEST_RUNNING) {
			testStatus = TEST_STOPPED;
			cancelTask(testTaskId);
			testTaskId = undefined;
		}
	});

	postMessage({
		state: WORKER_READY,
	});
});
