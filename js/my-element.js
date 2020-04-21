import { LitElement } from "../lit-element-2.3.1/lit-element.js";

/**
 * Change LitElement to render nodes as direct children without creating a shadow root.
 */
export class MyElement extends LitElement {
	createRenderRoot() {
		return this;
	}
}