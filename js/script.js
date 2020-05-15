"use strict";

document.querySelector("web-components-support").hidden = false;

import { nothing } from "lit-html";
import { StyledElement, register } from "./common/my-element.js";

register("web-components-support", class BrowserSupportElement extends StyledElement {
	render() {
		return nothing;
	}
});

import "./system-info/system-info.js";
import "./GPU/GPU-test.js";
import "./CPU/CPU-test-controller.js";
