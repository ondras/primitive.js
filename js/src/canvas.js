import * as util from "./util.js";

function getScale(width, height, limit) {
	return Math.max(width / limit, height / limit, 1);
}

/* FIXME move to util */
function getFill(canvas) {
	let data = canvas.getImageData();
	let w = data.width;
	let h = data.height;
	let d = data.data;
	let rgb = [0, 0, 0];
	let count = 0;
	let i;

	for (let x=0; x<w; x++) {
		for (let y=0; y<h; y++) {
			if (x > 0 && y > 0 && x < w-1 && y < h-1) { continue; }
			count++;
			i = 4*(x + y*w);
			rgb[0] += d[i];
			rgb[1] += d[i+1];
			rgb[2] += d[i+2];
		}
	}

	rgb = rgb.map(x => ~~(x/count)).map(util.clampColor);
	return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function svgRect(w, h) {
	let node = document.createElementNS(util.SVGNS, "rect");
	node.setAttribute("x", 0);
	node.setAttribute("y", 0);
	node.setAttribute("width", w);
	node.setAttribute("height", h);

	return node;
}

/* Canvas: a wrapper around a <canvas> element */
export default class Canvas {
	static empty(cfg, svg) {
		if (svg) {
			let node = document.createElementNS(util.SVGNS, "svg");
			node.setAttribute("viewBox", `0 0 ${cfg.width} ${cfg.height}`);
			node.setAttribute("clip-path", "url(#clip)");

			let defs = document.createElementNS(util.SVGNS, "defs");
			node.appendChild(defs);

			let cp = document.createElementNS(util.SVGNS, "clipPath");
			defs.appendChild(cp);
			cp.setAttribute("id", "clip");
			cp.setAttribute("clipPathUnits", "objectBoundingBox");
			
			let rect = svgRect(cfg.width, cfg.height);
			cp.appendChild(rect);

			rect = svgRect(cfg.width, cfg.height);
			rect.setAttribute("fill", cfg.fill);
			node.appendChild(rect);

			return node;
		} else {
			return new this(cfg.width, cfg.height).fill(cfg.fill);
		}
	}

	static original(url, cfg) {
		if (url == "test") {
			return Promise.resolve(this.test(cfg));
		}

		return new Promise(resolve => {
			let img = new Image();
			img.src = url;
			img.onload = e => {
				let w = img.naturalWidth;
				let h = img.naturalHeight;

				let computeScale = getScale(w, h, cfg.computeSize);
				cfg.width = w / computeScale;
				cfg.height = h / computeScale;

				let viewScale = getScale(w, h, cfg.viewSize);

				cfg.scale = computeScale / viewScale;

				let canvas = this.empty(cfg);
				canvas.ctx.drawImage(img, 0, 0, cfg.width, cfg.height);

				if (cfg.fill == "auto") { cfg.fill = getFill(canvas); }

				resolve(canvas);
			}
		});
	}

	static test(cfg) {
		cfg.width = cfg.computeSize;
		cfg.height = cfg.computeSize;
		cfg.scale = 1;
		let [w, h] = [cfg.width, cfg.height];

		let canvas = new this(w, h);
		canvas.fill("#fff");
		let ctx = canvas.ctx;

		ctx.fillStyle = "#f00";
		ctx.beginPath();
		ctx.arc(w/4, h/2, w/7, 0, 2*Math.PI, true);
		ctx.fill();

		ctx.fillStyle = "#0f0";
		ctx.beginPath();
		ctx.arc(w/2, h/2, w/7, 0, 2*Math.PI, true);
		ctx.fill();

		ctx.fillStyle = "#00f";
		ctx.beginPath();
		ctx.arc(w*3/4, h/2, w/7, 0, 2*Math.PI, true);
		ctx.fill();

		if (cfg.fill == "auto") { cfg.fill = getFill(canvas); }

		return canvas;
	}

	constructor(width, height) {
		this.node = document.createElement("canvas");
		this.node.width = width;
		this.node.height = height;
		this.ctx = this.node.getContext("2d");
		this._imageData = null;
	}

	clone() {
		let otherCanvas = new this.constructor(this.node.width, this.node.height);
		otherCanvas.ctx.drawImage(this.node, 0, 0);
		return otherCanvas;
	}

	fill(color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, this.node.width, this.node.height);
		return this;
	}

	getImageData() {
		if (!this._imageData) {
			this._imageData = this.ctx.getImageData(0, 0, this.node.width, this.node.height);
		}
		return this._imageData;
	}

	difference(otherCanvas) {
		let data = this.getImageData();
		let dataOther = otherCanvas.getImageData();

		return util.difference(data, dataOther);
	}

	distance(otherCanvas) {
		let difference = this.difference(otherCanvas);
		return util.differenceToDistance(difference, this.node.width*this.node.height);
	}

	drawStep(step) {
		this.ctx.globalAlpha = step.alpha;
		this.ctx.fillStyle = step.color;
		step.shape.render(this.ctx);
		return this;
	}
}
