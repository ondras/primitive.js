importScripts("util.js");

self.onmessage = function(e) {
	let imageDataSets = {
		shape: new Uint8Array(e.data.shape),
		current: new Uint8Array(e.data.current),
		target: new Uint8Array(e.data.target)
	}
	let result = computeColorAndDifferenceChange(imageDataSets, e.data.alpha);
	postMessage(result);
}
