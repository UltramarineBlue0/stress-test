import { html } from "lit-html";
import { StyledElement, register } from "./my-element.js";

register('test-controller', class ControllerElement extends StyledElement {
	render() {
		return html`
<p>Test: LitElement is working</p>
`;
	}
});