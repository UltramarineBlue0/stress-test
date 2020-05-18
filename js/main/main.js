"use strict";

import { html, nothing } from "lit-html";
import { StyledElement, register } from "../common/my-element.js";
import { isAbsent } from "../common/utils.js";

register("web-components-support", class BrowserSupportElement extends StyledElement {
	constructor() {
		super();
		this.hidden = true;
	}
	render() {
		return nothing;
	}
});

register("test-interface", class TestInterfaceElement extends StyledElement {
	constructor() {
		super();
		this.testRunning = false;
	}

	testButtonClick() {
		if (isAbsent(this.cpuTest) || isAbsent(this.cpuTest)) {
			return;
		}
		if (this.testRunning) {
			this.cpuTest.stopTest();
			this.gpuTest.stopTest();
			this.testButton.textContent = "Start test";
			this.testRunning = false;
		} else {
			try {
				this.gpuTest.startTest();
				this.cpuTest.startTest();
				this.testButton.textContent = "Stop test";
				this.testRunning = true;
			} catch (e) {
				// The components handle notifications themselves.
				console.log(e);
			}
		}
	}

	render() {
		return html`
<div class="container-fluid mb-3">
	<div class="row">
		<cpu-test class="col-md"></cpu-test>
		<gpu-test class="col-md"></gpu-test>
	</div>
	<div class="row justify-content-center">
		<div class="col-auto">
			<button type="button" class="btn btn-primary btn-lg" id="testButton" disabled @click=${this.testButtonClick}>Start test</button>
		</div>
	</div>
</div>
		`;
	}

	deferredInitialization() {
		this.testButton = this.querySelector("#testButton");
		this.cpuTest = this.querySelector("cpu-test");
		this.gpuTest = this.querySelector("gpu-test");
		requestIdleCallback(() => this.testButton.disabled = false);
	}
});

import "../system-info/system-info.js";
import "../CPU/CPU-test-control.js";
import "../GPU/GPU-test-control.js";