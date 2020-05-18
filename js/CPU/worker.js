// Firefox currently doesn't support modules in web workers yet, so
// emscripten is compiling to non module code. Relying on rollup+terser
// to remove all other module imports.
importScripts("WasmTest.js");

import { START_TEST, TEST_STOPPED, TEST_RUNNING, STOP_TEST, WORKER_READY } from "./CPU-test-event.js";
import { queueTask, cancelTask } from "../common/utils.js";

self.Module().then(WasmTest => {

	let testStatus = TEST_STOPPED;
	let testDuration = 0;
	let loopCount = 0;
	let testTaskId = undefined;

	const testFunction = () => {
		if (testStatus === TEST_RUNNING) {
			const startTime = performance.now();
			const result = WasmTest._runTest();
			// In minutes
			testDuration += (performance.now() - startTime) / 1000 / 60;
			loopCount++;
			// Currently loops per minute
			const score = loopCount / testDuration;
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
			testDuration = 0;
			loopCount = 0;
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
