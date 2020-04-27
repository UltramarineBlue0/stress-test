import { html } from "lit-html";
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

export const externalLink = (text, url) => html`
<a href="${url}" target="_blank" rel="nofollow noopener noreferrer" referrerpolicy="no-referrer">${text}</a>
`;