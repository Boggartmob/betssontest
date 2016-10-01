import {IInputDataItem, IChartData} from './interface';
/**
 * Use with webworker ONLY!
 */
export let webworkerFunctions = {
	/**
	 * Returns data structure to pass to D3 lib.
	 * @param event
	 */
	webworkerInputDataConvertFunction: function webworkerInputDataConvertFunction(event) {
		console.time('Webworker convert JSON to chart data');
		let i;
		/**
		 * @type Object.<number, number>
         */
		let result = {};
		let data: IInputDataItem[] = event.data;
		data.forEach((item) => {
			// Convert time to minute-based timestamp.
			let at = (new Date(item.ArrivalTime.trim())).getTime() / 60000;
			let lt = (new Date(item.LeaveTime.trim())).getTime() / 60000;

			if (at <= lt) {
				for (i = at; i <= lt; i++) {
					if (!(i in result)) {
						result[i] = 0;
					}

					result[i] += 1;
				}
			} else {
				console.warn('INCORRECT TIME FOR ITEM ID %s. ArrivalTime: %s; LeaveTime: %s',
					item.Id, item.ArrivalTime, item.LeaveTime);
			}
		});
		console.timeEnd('Webworker convert JSON to chart data');
		this.postMessage(result);
	},

	webworkerPrepareChartDataFunction: function webworkerPrepareChartDataFunction(event) {
		console.time('Webworker agregate chart data');
		let result: IChartData = {maxRanges: [], maxCount: 0, data: []};
		let _data = {};
		/**
		 * @type Object.<number, number>[]
		 */
		let data = event.data;

		data.forEach((item) => {
			let keys = Object.keys(item);
			keys.forEach((key) => {
				if (!(key in _data)) {
					_data[key] = 0;
				}

				_data[key] += item[key];

				if (result.maxCount < _data[key]) {
					result.maxCount = _data[key];
				}
			});
		});

		let keys = Object.keys(_data);

		let maxKeys = keys.filter((k) => {
			return _data[k] === result.maxCount;
		});

		maxKeys.sort((a: any, b: any) => {
			return parseInt(a, 10) - parseInt(b, 10);
		});

		let ranges = [];
		let currentRange = [];

		maxKeys.forEach((item: any, i: number, arr: any[]) => {
			currentRange.push(item);

			if ((arr[i + 1] - item) > 1) {
				ranges.push(currentRange);
				currentRange = [];
			}

			if (i + 1 === arr.length) {
				ranges.push(currentRange);
			}
		});

		result.maxRanges = ranges.map((r: number[]) => {
			return {
				from: r[0] * 60000,
				to: r[r.length - 1] * 60000,
				total: r[r.length - 1] - r[0]
			};
		});

		// d3.entries moved to webworker.
		let entries = [];
		for (let key in _data) {
			entries.push({key: key, value: _data[key]});
		}
		entries.sort((a, b) => {
			return a.key - b.key;
		});

		result.data = entries;

		console.timeEnd('Webworker agregate chart data');
		this.postMessage(result);
	},

	webworkerParseCSVFunction: function webworkerParseCSVFunction(event) {
		let stringsList = event.data.trim().split('\n');
		let datePart = (new Date()).toISOString().split('T')[0];
		let result: IInputDataItem[] = [];

		try {
			result = stringsList.map((line, index) => {
				let timeInfo = line.split(', ');
				return {
					'ArrivalTime': `${datePart}T${timeInfo[0].trim()}:00`,
					'LeaveTime': `${datePart}T${timeInfo[1].trim()}:00`,
					'Id': index
				};
			});
		} catch (e) {
			console.warn(e);
		}

		this.postMessage(result);
	},

	webworkerParseJSONFunction: function webworkerParseJSONFunction(event) {
		console.time('Webworker parsing JSON');
		let result: IInputDataItem[] = [];
		try {
			result = JSON.parse(event.data);
		} catch (e) {
			console.warn(e);
		}
		console.timeEnd('Webworker parsing JSON');

		this.postMessage(result);
	}
};
