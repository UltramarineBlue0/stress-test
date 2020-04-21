import { html } from "../lit-element-2.3.1/lit-element.js";
import { MyElement } from "./my-element.js";

class ControllerElement extends MyElement {
	render() {
		return html`
		<p>Test: LitElement is working</p>
		`;
	}
}

customElements.define('test-controller', ControllerElement);