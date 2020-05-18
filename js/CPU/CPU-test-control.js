import { START_TEST, STOP_TEST, WORKER_READY, TEST_RUNNING } from "./CPU-test-event.js";
import { TestElement, register } from "../common/my-element.js";
import { html } from "lit-html";
import { notify } from "../common/notify.js";
import { isAbsent } from "../common/utils.js";

// Worker constructors url is relative to the html document, not this script
const workerScript = new URL("worker.min.js", import.meta.url);

// TODO: convert to module worker when firefox supports it
class WasmTestWorker {
	constructor() {
		this.worker = new Worker(workerScript, {
			type: "classic",
			credentials: "omit",
		});
		this.worker.onerror = e => {
			notify(`CPU test: Web worker error: ${e.message}`);
		};
		this.worker.onmessage = e => this.handleEvent(e);
		// Score calculated inside the web worker.
		this.score = 0;
	}

	handleEvent(event) {
		const workerState = event.data.state;
		if (workerState === WORKER_READY) {
			this.worker.postMessage(START_TEST);
		} else if (workerState === TEST_RUNNING) {
			this.score = event.data.score;
		}
	}

	stop() {
		this.worker.postMessage(STOP_TEST);
		this.worker.terminate();
	}
}

const minThreads = 1;
const visibleThreads = navigator.hardwareConcurrency;
const maxThreads = 8 * visibleThreads;

register("cpu-test", class CPUTestElement extends TestElement {
	render() {
		return html`
<h5>CPU Test</h5>
<div class="form-group" ?hidden=${this.testStats.testRunning}>
	<label for="numberOfThreads">Thread count</label>
	<input type="number" class="form-control" inputmode="numeric" min=${minThreads} max=${maxThreads} value=${visibleThreads} required id="numberOfThreads">
</div>
<div ?hidden=${!this.testStats.testRunning}>
<p><b>Score</b></p>
<p>${this.testStats.testScore}</p>
</div>
		`;
	}

	updateTestScore() {
		let score = 0;
		this.cpuThreads.forEach(thread => {
			score += thread.score;
		});
		this.testStats.testScore = score;
		this.requestUpdate();
		this.scoreUpdater = setTimeout(() => this.updateTestScore(), 1000);
	}

	startTest() {
		if (this.numberOfThreads.reportValidity()) {
			const threadCount = Math.trunc(this.numberOfThreads.valueAsNumber);
			this.cpuThreads = [];
			for (let i = 0; i < threadCount; i++) {
				this.cpuThreads.push(new WasmTestWorker());
			}
			// Let the test warm up for 1 minute
			this.scoreUpdater = setTimeout(() => this.updateTestScore(), 60000);
			this.testStats.testScore = "---running---";
			this.testStats.testRunning = true;
			this.requestUpdate();
		} else {
			throw 1;
		}
	}

	stopTest() {
		if (!isAbsent(this.cpuThreads)) {
			this.cpuThreads.forEach(thread => thread.stop());
		}
		this.cpuThreads = [];
		if (!isAbsent(this.scoreUpdater)) {
			clearTimeout(this.scoreUpdater);
		}
		this.testStats.testScore = "";
		this.testStats.testRunning = false;
		this.requestUpdate();
	}

	deferredInitialization() {
		this.numberOfThreads = this.querySelector("#numberOfThreads");
	}
});