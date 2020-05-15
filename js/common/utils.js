
export const isFunction = func => (typeof func) === "function";

export const isAbsent = value => (value === undefined) || (value === null);

// For array, set or map-like objects
export const isEmpty = value => (value.size === 0) || (value.length === 0);

/**
 * Shallow immutability for pure data carriers. Use sparingly.
 */
export const ξ = anyObj => Object.freeze(Object.assign(Object.create(null), anyObj));

// Unclamped setTimeout using MessageChannel (For throttling behaviour: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Notes)
// Creates "macro" tasks, which plays nicer with the main UI thread: (For macro/micro distinction: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask)
const channel = new MessageChannel();
const receiver = channel.port1;
const sender = channel.port2;

// In an earlier project, I've tested that map here is faster than array or plain objects in both Firefox and Chrome.
// Not sure if it's still true, but the difference wasn't big.
const queuedTasks = new Map();
let nextTaskID = 0;

receiver.onmessage = event => {
	const taskID = event.data;
	if (queuedTasks.has(taskID)) {
		// Run if not cancelled
		const task = queuedTasks.get(taskID);
		queuedTasks.delete(taskID);
		task();
	}
};

/**
 * @returns The id of the given task, which can be used to cancel that task
 */
export const queueTask = func => {
	if (!isFunction(func)) {
		throw new Error("Not a function");
	}

	const currentID = nextTaskID;
	++nextTaskID;
	queuedTasks.set(currentID, func);
	sender.postMessage(currentID);

	return currentID;
};

/**
 * @returns True if the task was in the queue and is now removed, false if the id doesn't correspond to any tasks in the queue
 */
export const cancelTask = taskID => queuedTasks.delete(taskID);