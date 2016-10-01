import {IEvent} from './interface';
import {CONFIG} from '../config';

let d3 = require('../../../node_modules/d3');

let _timeRangeDateParser = d3.timeParse(CONFIG.dateFormat);
	
export class Event implements IEvent {
	constructor(public type: string, public data: any) {}
}

export class NavigationComponentEvent extends Event {
	public action: string;
	constructor(action: string, data: any = {}) {
		super('NavigationComponentEvent', data);
		this.action = action;
	}
}

export class TimeRangeComponentEvent extends Event {
	constructor(data: {dateFrom: string, dateTo: string}) {

		let df = _timeRangeDateParser(data.dateFrom);
		data.dateFrom = df ? df : new Date();

		let dt = _timeRangeDateParser(data.dateTo);
		data.dateTo = dt ? dt : new Date();

		super('TimeRangeComponentEvent', data);
	}
}

