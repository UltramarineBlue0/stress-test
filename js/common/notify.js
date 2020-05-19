import { register, StyledElement } from "./my-element.js";
import { isAbsent } from "./utils.js";
import { html } from "lit-html";

// Singleton element
let notifier = null;

register("notify-element", class NotifyElement extends StyledElement {
	static properties = {
		messages: {
			type: Array,
		},
	};

	messages = [];

	deferredInitialization() {
		notifier = this;
	}

	render() {
		return html`
${this.messages.map(text => html`
<p class="alert alert-secondary">${text}</p>
`)}
`;
	}

	/**
	 * Shows the last three messages
	 */
	addMessage(messageText) {
		if (this.messages.length === 3) {
			this.messages.pop();
		}
		this.messages.unshift(messageText);
		this.requestUpdate();
	}
});

export const notify = message => {
	if (!isAbsent(notifier)) {
		notifier.addMessage(String(message));
	}
};