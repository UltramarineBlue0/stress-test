"use strict";

import { html, nothing } from "lit-html";
import { StyledElement, register } from "./my-element.js";

register("web-components-support", class BrowserSupportElement extends StyledElement {
	constructor() {
		super();
		this.hidden = true;
	}

	render() {
		return nothing;
	}
});

register("test-controller", class ControllerElement extends StyledElement {
	render() {
		return html`
<p>Test: LitElement is working</p>
`;
	}
});