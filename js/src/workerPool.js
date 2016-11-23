class WorkerPool {
	constructor(count) {
		this._freeWorkers = [];
		this._busyWorkers = [];
		this._queue = [];

		for (let i=0;i<count;i++) {
			let worker = new Worker("js/worker.js");
			worker.addEventListener("message", this);
			this._freeWorkers.push(worker);
		}
	}

	postMessage(data, transferable) {
		return new Promise(resolve => {
			this._waitForFreeWorker().then(worker => {
				this._busyWorkers.push({
					worker,
					resolve
				});
				worker.postMessage(data, transferable);
			});
		});
	}

	handleEvent(e) {
		let index = -1;
		this._busyWorkers.some((item, i) => {
			if (item.worker == e.target) { 
				index = i;
				return true;
			} else {
				return false;
			}
		});

		let item = this._busyWorkers.splice(index, 1)[0];
		item.resolve(e.data);
		this._freeWorkers.push(item.worker);
		this._checkQueue();
	}

	_waitForFreeWorker() {
		let promise = new Promise(resolve => this._queue.push(resolve));
		this._checkQueue();
		return promise;
	}

	_checkQueue() {
		if (this._freeWorkers.length == 0 || this._queue.length == 0) { return; }
		this._queue.shift()(this._freeWorkers.shift());
	}
}

const workerPool = new WorkerPool(4);
