import { html } from "lit-html";
import { StyledElement, register } from "../common/my-element.js";

/*
* TODO: switch to OffscreenCanvas, when firefox adds support for it
* TODO: switch to WebGPU, when both chromium and firefox supports it
*/

// 
const renderAreaSize = 1987;

register("test-target", class TestTargetElement extends StyledElement {
	render() {
		return html`
<canvas class="background-canvas"></canvas>`;
	}

	deferredInitialization() {
		this.testCanvas = this.querySelector("canvas");
		this.testCanvas.width = renderAreaSize;
		this.testCanvas.height = renderAreaSize;


		this.testWebGLContext = this.testCanvas.getContext("webgl2", {
			alpha: false,
			antialias: false,
			depth: false,
			desynchronized: true,
			failIfMajorPerformanceCaveat: false,
			powerPreference: "high-performance",
			premultipliedAlpha: true,
			preserveDrawingBuffer: false,
			stencil: false,
		});

		// globalThis.testTargetElement = this;
		// console.dir(this);
	}
});