import { LitElement } from "lit-element";

/**
 * Change LitElement to render nodes as direct children without creating a shadow root.
 * This way, bootstrap's css applies to the child nodes.
 */
export class StyledElement extends LitElement {
	createRenderRoot() {
		return this;
	}
};

export const register = (htmlTag, classFunc) => {
	customElements.define(htmlTag, classFunc);
};