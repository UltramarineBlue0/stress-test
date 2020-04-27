"use strict";

import { nothing } from "lit-html";
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

import "./system-info/system-info.js";
