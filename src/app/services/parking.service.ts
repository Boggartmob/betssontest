import { Injectable } from '@angular/core';
import { Jsonp } from '@angular/http';
import { WebworkerService } from './webworker.service';

import 'rxjs/add/operator/toPromise';

import { webworkerFunctions } from '../shared/utils';
import { CONFIG } from '../config';
import {IInputDataItem, IChartData} from '../shared/interface';

@Injectable()
export class ParkingService {
	private _itemsToLoadCount: number = CONFIG.defaultItemsToLoad;
	private _daysToLoadCount: number = CONFIG.defaultDaysToLoad;
	private _dataSourceURLPattern: string = CONFIG.dataSourceURLPattern;
	private _dataSourceURL: string;
	private _JSONParserWorkerId: string = 'ParkingServiceWebWorkerJSONParser';
	private _dataAggregatorWorkerId: string = 'ParkingServiceWebWorkerDataAggregator';
	private _dataConverterWorkerId: string = 'ParkingServiceWebWorkerDataConverter_';
	private _CSVParserWorkerId: string = 'ParkingServiceWebWorkerCSVParser_';

	constructor(private _jsonp: Jsonp, private _wwService: WebworkerService) {
		this._updateLoadURL();
	}

	private _updateLoadURL() {
		this._dataSourceURL = this._dataSourceURLPattern.replace(/%ITEMS_COUNT%/, this._itemsToLoadCount.toString());
		this._dataSourceURL = this._dataSourceURL.replace(/%DAYS_COUNT%/, this._daysToLoadCount.toString());

		return this._dataSourceURL;
	}

	private _agregateData(dataItems): Promise<IChartData> {
		return this._wwService.runTask(this._dataAggregatorWorkerId,
			webworkerFunctions.webworkerPrepareChartDataFunction,
			dataItems);
	}

	/**
	 * @param data
	 * @returns Promise<Promise<{number: number}>[]>
     * @private
     */
	private _convertData(data: IInputDataItem[]): Promise<Promise<any>[]> {
		let i;
		let workersCount = 5;
		let itemsPerWorker = Math.round(data.length / workersCount) + workersCount;
		let promises = [];

		for (i = 0; i < workersCount; i++) {
			let workerId = this._dataConverterWorkerId + i;
			promises.push(this._wwService.runTask(workerId,
				webworkerFunctions.webworkerInputDataConvertFunction,
				data.splice(0, itemsPerWorker)));
		}

		return Promise.all(promises);
	}

	getChartDataFromCSV(text): Promise<IChartData> {
		return this.parseCSV(text)
			.then(this._convertData.bind(this))
			.then(this._agregateData.bind(this));
	}

	getChartDataFromApi(): Promise<IChartData> {
		return this.loadJSONData()
			.then(this._convertData.bind(this))
			.then(this._agregateData.bind(this));
	}

	loadJSONData(): Promise<IInputDataItem[]> {
		return this.loadData().then(
				this._wwService.runTask.bind(
					this._wwService,
					this._JSONParserWorkerId,
					webworkerFunctions.webworkerParseJSONFunction)
			);
	}

	loadData(): Promise<string> {
		console.time('loadData: loading');
		return this._jsonp.get(this._updateLoadURL())
			.toPromise()
			.then((response) => {
				console.timeEnd('loadData: loading');
				return response.text();
			});
	}

	setDataLoadParams(count = 100000, days = 30): void {
		this._itemsToLoadCount = count;
		this._daysToLoadCount = days;
		this._updateLoadURL();
	}

	parseCSV(CSVString): Promise<IInputDataItem[]> {
		return this._wwService.runTask(this._CSVParserWorkerId,
			webworkerFunctions.webworkerParseCSVFunction,
			CSVString);
	}
}
