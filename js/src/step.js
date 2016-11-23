import * as util from "./util.js";
import State from "./state.js";

/* Step: a Shape, color and alpha */
export default class Step {
	constructor(shape, cfg) {
		this.shape = shape;
		this.cfg = cfg;
		this.alpha = cfg.alpha;
		
		/* these two are computed during the .compute() call */
		this.color = "#000";
		this.distance = Infinity;
	}

	toSVG() {
		let node = this.shape.toSVG();
		node.setAttribute("fill", this.color);
		node.setAttribute("fill-opacity", this.alpha.toFixed(2));
		return node;
	}

	/* apply this step to a state to get a new state. call only after .compute */
	apply(state) {
		let newCanvas = state.canvas.clone().drawStep(this);
		return new State(state.target, newCanvas, this.distance);
	}

	/* find optimal color and compute the resulting distance */
	compute(state) {
		let pixels = state.canvas.node.width * state.canvas.node.height;
		let offset = this.shape.bbox;

		let imageData = {
			shape: this.shape.rasterize(this.alpha).getImageData(),
			current: state.canvas.getImageData(),
			target: state.target.getImageData()
		};

		let {color, differenceChange} = util.computeColorAndDifferenceChange(offset, imageData, this.alpha);
		this.color = color;
		let currentDifference = util.distanceToDifference(state.distance, pixels);
		if (-differenceChange > currentDifference) debugger;
		this.distance = util.differenceToDistance(currentDifference + differenceChange, pixels);

		return Promise.resolve(this);
	}

	/* return a slightly mutated step */
	mutate() {
		let newShape = this.shape.mutate(this.cfg);
		let mutated = new this.constructor(newShape, this.cfg);
		if (this.cfg.mutateAlpha) {
			let mutatedAlpha = this.alpha + (Math.random()-0.5) * 0.08;
			mutated.alpha = util.clamp(mutatedAlpha, .1, 1);
		}
		return mutated;
	}
}
