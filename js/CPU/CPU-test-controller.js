import { START_TEST, STOP_TEST, WORKER_READY } from "./CPU-test-event.js";

// Worker constructors url is relative to the html document, not this script
const workerScript = new URL("worker.min.js", import.meta.url);

// TODO: convert to module worker when firefox supports it
const worker = new Worker(workerScript, {
	type: "classic",
	credentials: "omit",
});

worker.onerror = e => {
	console.dir(e);
};

worker.onmessage = e => {
	console.dir(e.data);
	if (e.data === WORKER_READY) {
		worker.postMessage(START_TEST);

		setTimeout(() => {
			worker.postMessage(STOP_TEST);
		}, 9);
	}
};
