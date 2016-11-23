import {Triangle, Rectangle, Ellipse, Smiley} from "./shape.js";

const numberFields = ["computeSize", "viewSize", "steps", "shapes", "alpha", "mutations"];
const boolFields = ["mutateAlpha"];
const fillField = "fill";
const shapeField = "shapeType";
const shapeMap = {
	"triangle": Triangle,
	"rectangle": Rectangle,
	"ellipse": Ellipse,
	"smiley": Smiley
}

function fixRange(range) {
	function sync() {
		let value = range.value;
		range.parentNode.querySelector(".value").innerHTML = value;
	}

	range.oninput = sync;
	sync();
}

export function init() {
	let ranges = document.querySelectorAll("[type=range]");
	Array.from(ranges).forEach(fixRange);
}

export function lock() {
	/* fixme */
}

export function showResult(raster, vector) {
	let node;

	node = document.querySelector("#placeholder-raster");
	node.innerHTML = "";
	node.appendChild(raster);

	node = document.querySelector("#placeholder-vector");
	node.innerHTML = "";
	node.appendChild(vector);
}

export function getConfig() {
	let form = document.querySelector("form");
	let cfg = {};

	numberFields.forEach(name => {
		cfg[name] = Number(form.querySelector(`[name=${name}]`).value);
	});

	boolFields.forEach(name => {
		cfg[name] = form.querySelector(`[name=${name}]`).checked;
	});

	cfg.shapeTypes = [];
	let shapeFields = Array.from(form.querySelectorAll(`[name=${shapeField}]`));
	shapeFields.forEach(input => {
		if (!input.checked) { return; }
		cfg.shapeTypes.push(shapeMap[input.value]);
	});

	let fillFields = Array.from(form.querySelectorAll(`[name=${fillField}]`));
	fillFields.forEach(input => {
		if (!input.checked) { return; }
		
		switch (input.value) {
			case "auto": cfg.fill = "auto"; break;
			case "fixed": cfg.fill = form.querySelector("[name='fill-color']").value; break;
		}
	});

	return cfg;
}
