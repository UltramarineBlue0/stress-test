import { isEmpty } from "./utils.js";

export class SlidingWindowScoring {
	scores = [];
	/**
	 * By default 1 minute window
	 */
	constructor(timeFrame = 1) {
		// perf.now is in milliseconds
		this.maxDiff = timeFrame * 60 * 1000;
	}

	addScore(newScore, now = performance.now()) {
		this.scores.push({
			time: now,
			score: newScore,
		});
	}

	static newInitialValue() { return 0; }

	static accumulate() { return 0; }

	calculateScore(now = performance.now()) {
		while ((!isEmpty(this.scores)) && (!this.isInsideSlidingWindow(this.scores[0].time, now))) {
			this.scores.shift();
		}
		// Call subclass version of these functions
		const initialValue = this.constructor.newInitialValue();
		return this.scores.reduce(this.constructor.accumulate, initialValue);
	}

	isInsideSlidingWindow(timeStamp, now) {
		// perf.now is in milliseconds
		const diff = now - timeStamp;
		return diff < this.maxDiff;
	}
};