import * as ui from "./ui.js";
import Canvas from "./canvas.js";
import Optimizer from "./optimizer.js";

const nodes = {
	output: document.querySelector("#output"),
	original: document.querySelector("#original"),
	steps: document.querySelector("#steps"),
	raster: document.querySelector("#raster"),
	vector: document.querySelector("#vector"),
	vectorText: document.querySelector("#vector-text"),
	types: Array.from(document.querySelectorAll("#output [name=type]"))
}

let steps;

function go(original, cfg) {
	ui.lock();

	nodes.steps.innerHTML = "";
	nodes.original.innerHTML = "";
	nodes.raster.innerHTML = "";
	nodes.vector.innerHTML = "";
	nodes.vectorText.value = "";

	nodes.output.style.display = "";
	nodes.original.appendChild(original.node);

	let optimizer = new Optimizer(original, cfg);
	steps = 0;

	let cfg2 = Object.assign({}, cfg, {width:cfg.scale*cfg.width, height:cfg.scale*cfg.height});
	let result = Canvas.empty(cfg2, false);
	result.ctx.scale(cfg.scale, cfg.scale);
	nodes.raster.appendChild(result.node);

	let svg = Canvas.empty(cfg, true);
	svg.setAttribute("width", cfg2.width);
	svg.setAttribute("height", cfg2.height);
	nodes.vector.appendChild(svg);

	let serializer = new XMLSerializer();

	optimizer.onStep = (step) => {
		if (step) {
			result.drawStep(step);
			svg.appendChild(step.toSVG());
			let percent = (100*(1-step.distance)).toFixed(2);
			nodes.vectorText.value = serializer.serializeToString(svg);
			nodes.steps.innerHTML = `(${++steps} of ${cfg.steps}, ${percent}% similar)`;
		}
	}
	optimizer.start();

	document.documentElement.scrollTop = document.documentElement.scrollHeight;
}

function onSubmit(e) {
	e.preventDefault();

	let input = document.querySelector("input[type=file]");
	let url = "test";
	if (input.files.length > 0) {
		let file = input.files[0];
		url = URL.createObjectURL(file);
	}

	let cfg = ui.getConfig();

	Canvas.original(url, cfg).then(original => go(original, cfg));
}

function init() {
	nodes.output.style.display = "none";
	nodes.types.forEach(input => input.addEventListener("click", syncType));
	ui.init();
	syncType();
	document.querySelector("form").addEventListener("submit", onSubmit);
}

function syncType() {
	nodes.output.className = "";
	nodes.types.forEach(input => {
		if (input.checked) { nodes.output.classList.add(input.value); }
	});
}

init();
