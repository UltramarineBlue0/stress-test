// Firefox currently doesn't support modules in web workers yet, so
// emscripten is compiling to non module code. Relying on rollup+terser
// to remove all other module imports.
importScripts("WasmTest.js");

import { START_TEST, TEST_STOPPED, TEST_RUNNING, STOP_TEST, WORKER_READY } from "./CPU-test-event.js";
import { queueTask, cancelTask, isFunction } from "../common/utils.js";

self.Module().then(WasmTest => {

	let testStatus = TEST_STOPPED;
	let result = 0;
	let testTaskId = undefined;
	let startTime = undefined;

	const testFunction = () => {
		if (testStatus === TEST_RUNNING) {
			result += WasmTest._runTest();
			testTaskId = queueTask(testFunction);
		}
	};

	self.addEventListener("message", e => {
		console.log(e.data);

		if ((e.data === START_TEST) && testStatus !== TEST_RUNNING) {
			testStatus = TEST_RUNNING;
			result = 0;
			testTaskId = queueTask(testFunction);
			startTime = performance.now();
		}
		if ((e.data === STOP_TEST) && testStatus === TEST_RUNNING) {
			testStatus = TEST_STOPPED;
			cancelTask(testTaskId);
			testTaskId = undefined;
			postMessage(result);
			console.log(`Test duration: ${performance.now() - startTime}`);
		}
	});

	postMessage(WORKER_READY);
});
