import { Injectable } from '@angular/core';
import {IEvent, IWebworkerEvent} from "../shared/interface";

@Injectable()
export class WebworkerService {

	private _workersPool: Object = {};
	private _id: number = 0;

	private static _defaultHandler(e) {
		console.error(e);
	}

	constructor() { }

	private _getIdForWorker() {
		this._id += 1;
		return this._id;
	}

	getWorker(id) {
		if (id in this._workersPool) {
			return this._workersPool[id];
		} else {
			console.warn('There is no worker with id %s', id);
		}

		return null;
	}

	createWorker(id, fn, onMessage = null, onError = null): any {
		if (!id) {
			id = this._getIdForWorker();
		}

		if (id in this._workersPool) {
			return this._workersPool[id];
		}

		this._workersPool[id] = new Worker(
			window.URL.createObjectURL(
				new Blob(['onmessage = ' + fn.toString()])
			)
		);

		this._workersPool[id].onmessage = onMessage ? onMessage : WebworkerService._defaultHandler;
		this._workersPool[id].onerror = onError ? onError : WebworkerService._defaultHandler;
		this._workersPool[id]['id'] = id;

		return this._workersPool[id];
	}

	killWorker(id) {
		if (id in this._workersPool) {
			this._workersPool[id].terminate();
			delete this._workersPool[id];
		} else {
			console.warn('There is no worker with id %s', id);
		}
	}

	runTask(workerId, fn, postMessageArg) {
		let webWorker = this.getWorker(workerId);
		if (!webWorker) {
			webWorker = this.createWorker(workerId, fn);
		}

		return new Promise((resolve, reject) => {
			webWorker.onmessage = (e: IWebworkerEvent) => { resolve(e.data); };
			webWorker.onerror = reject;
			webWorker.postMessage(postMessageArg);
		});
	}
}
