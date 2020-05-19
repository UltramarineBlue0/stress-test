import { html } from "lit-html";
import { LitElement } from "lit-element";
import { isAbsent, queueTask } from "./utils.js";

/**
 * Change LitElement to render nodes as direct children without creating a shadow root.
 * This way, bootstrap's css applies to the child nodes.
 */
export class StyledElement extends LitElement {
	createRenderRoot() {
		return this;
	}

	firstUpdated(changedProperties) {
		if (!isAbsent(this.deferredInitialization)) {
			queueTask(() => this.deferredInitialization(changedProperties));
		}
	}
};

export class TestElement extends StyledElement {
	static properties = {
		testStats: {
			type: Object,
		},
	};

	testStats = Object.create(null);

	constructor() {
		super();
		this.testStats.testRunning = false;
	}

	startTest() { }

	stopTest() { }
}

export const register = (htmlTag, classFunc) => {
	customElements.define(htmlTag, classFunc);
};

export const externalLink = (text, url) => html`
<a href="${url}" target="_blank" rel="nofollow noopener noreferrer" referrerpolicy="no-referrer">${text}</a>`;