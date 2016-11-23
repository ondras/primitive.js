import Step from "./step.js";
import State from "./state.js";
import Canvas from "./canvas.js";
import {Shape} from "./shape.js";

export default class Optimizer {
	constructor(original, cfg) {
		this.cfg = cfg;
		this.state = new State(original, Canvas.empty(cfg));
		this._steps = 0;
		this.onStep = () => {};
		console.log("initial distance %s", this.state.distance);
	}

	start() {
		this._ts = Date.now();
		this._addShape();
	}

	_addShape() {
		this._findBestStep().then(step => this._optimizeStep(step)).then(step => {
			this._steps++;
			if (step.distance < this.state.distance) { /* better than current state, epic */
				this.state = step.apply(this.state);
				console.log("switched to new state (%s) with distance: %s", this._steps, this.state.distance);
				this.onStep(step);
			} else { /* worse than current state, discard */
				this.onStep(null);
			}
			this._continue();
		});
	}

	_continue() {
		if (this._steps < this.cfg.steps) {
			setTimeout(() => this._addShape(), 10);
		} else {
			let time = Date.now() - this._ts;
			console.log("target distance %s", this.state.distance);
			console.log("real target distance %s", this.state.target.distance(this.state.canvas));
			console.log("finished in %s", time);
		}
	}

	_findBestStep() {
		const LIMIT = this.cfg.shapes;

		let bestStep = null;
		let promises = [];

		for (let i=0;i<LIMIT;i++) {
			let shape = Shape.create(this.cfg);

			let promise = new Step(shape, this.cfg).compute(this.state).then(step => {
				if (!bestStep || step.distance < bestStep.distance) {
					bestStep = step;
				}
			});
			promises.push(promise);
		}

		return Promise.all(promises).then(() => bestStep);
	}

	_optimizeStep(step) {
		const LIMIT = this.cfg.mutations;

		let totalAttempts = 0;
		let successAttempts = 0;
		let failedAttempts = 0;
		let resolve = null;
		let bestStep = step;
		let promise = new Promise(r => resolve = r);

		let tryMutation = () => {
			if (failedAttempts >= LIMIT) {
				console.log("mutation optimized distance from %s to %s in (%s good, %s total) attempts", arguments[0].distance, bestStep.distance, successAttempts, totalAttempts);
				return resolve(bestStep);
			}

			totalAttempts++;
			bestStep.mutate().compute(this.state).then(mutatedStep => {
				if (mutatedStep.distance < bestStep.distance) { /* success */
					successAttempts++;
					failedAttempts = 0;
					bestStep = mutatedStep;
				} else { /* failure */
					failedAttempts++;
				}
				
				tryMutation();
			});
		}

		tryMutation();

		return promise;
	}
}
