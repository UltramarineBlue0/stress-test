import { StyledElement, register, externalLink } from "../common/my-element.js";
import { html } from "lit-html";
import { isFunction, isAbsent, isEmpty } from "../common/utils.js";

/*
* Show some information about the browser and the hardware.
* Not meant to be thorough or exhaustive.
*/

const compileInformation = (title, url, nameValueMap) => {
	const entries = [];

	for (let [name, value] of nameValueMap) {
		if (isFunction(value)) {
			// value can be an getter function
			value = value();
		}
		if ((!isAbsent(value)) && (!isEmpty(value))) {
			// only show entry if value is not empty
			entries.push(html`<li>${name}: ${value}</li>`);
		}
	}

	if (isEmpty(entries)) {
		// Skip section if no information available
		return html``;
	} else {
		return html`
<li class="list-group-item">
	${externalLink(title, url)}
	<ul>
		${entries}
	</ul>
</li>`;
	}
};

const infosOnNavigator = compileInformation("navigator", "https://developer.mozilla.org/en-US/docs/Web/API/Navigator", new Map([
	["userAgent", navigator.userAgent],
	["vendor", navigator.vendor],
	["platform", navigator.platform],
	["hardwareConcurrency", navigator.hardwareConcurrency],
	["deviceMemory", navigator.deviceMemory ? `${navigator.deviceMemory} GB` : null],
]));

const infosOnWindow = compileInformation("window", "https://developer.mozilla.org/en-US/docs/Web/API/Window", new Map([
	["devicePixelRatio", window.devicePixelRatio],
	["innerWidth x innerHeight", `${window.innerWidth} x ${window.innerHeight}`],
	["outerWidth x outerHeight", `${window.outerWidth} x ${window.outerHeight}`],
	["screenLeft / screenTop", `${window.screenLeft} / ${window.screenTop}`],
]));

const infosOnScreen = compileInformation("screen", "https://developer.mozilla.org/en-US/docs/Web/API/Screen", new Map([
	["orientation.type", screen.orientation ? screen.orientation.type : null],
	["orientation.angle", screen.orientation ? screen.orientation.angle : null],
	["width x height", `${screen.width} x ${screen.height}`],
	["availWidth x availHeight", `${screen.availWidth} x ${screen.availHeight}`],
	["colorDepth", screen.colorDepth],
	["pixelDepth", screen.pixelDepth],
	["availLeft / availTop", `${screen.availLeft} / ${screen.availTop}`],
	["left", screen.left],
	["top", screen.top],
]));

// let infosOnUserAgent = html``; TODO: add if https://github.com/WICG/ua-client-hints#a-proposal were to become a web standard

let infosOnBattery = html``; // Not sure how long chrome will keep navigator.getBattery, firefox had it but was removed again

const asyncGetInfos = async (asyncGetter, buildInfos) => {
	try {
		const infos = await asyncGetter();
		buildInfos(infos);
	} catch {
		// leave the fields empty
	}
};

Promise.allSettled([
	asyncGetInfos(
		async () => await navigator.getBattery(),
		batteryInfo => {
			infosOnBattery = compileInformation("navigator.getBattery", "https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager",
				new Map([
					["level", batteryInfo.level],
					["charging", batteryInfo.charging],
					["chargingTime", batteryInfo.chargingTime],
					["dischargingTime", batteryInfo.dischargingTime],
				]));
		}),
]).finally(() => {
	register("system-info", class SystemInfoElement extends StyledElement {
		render() {
			return html`
<ul class="list-group list-group-flush">
	${infosOnNavigator}
	${infosOnBattery}
	${infosOnWindow}
	${infosOnScreen}
</ul>`;
		}
	});
});