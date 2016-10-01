import { Component, OnInit, EventEmitter, Output, Input, ViewEncapsulation } from '@angular/core';
import { TimeRangeComponentEvent } from '../../shared/event';

@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'app-time-range',
	templateUrl: './time-range.component.html',
	styleUrls: ['./time-range.component.css', './768.time-range.component.css']
})

export class TimeRangeComponent implements OnInit {


	@Output()
	onChange = new EventEmitter<TimeRangeComponentEvent>();

	private _dateFrom: any = 2;
	private _dateTo: any = 2;

	@Input()
	public set minDate(date) {
		this._dateFrom = date ? date : 1;
	}

	@Input()
	public set maxDate(date) {
		this._dateTo = date ? date : 1;
	}

	public set dateFrom(date) {
		this._dateFrom = date;

		this.onChange.emit(new TimeRangeComponentEvent({
			'dateFrom': this._dateFrom,
			'dateTo': this._dateTo
		}));
	}

	public get dateFrom() {
		return this._dateFrom;
	}

	public set dateTo(date) {
		this._dateTo = date;

		this.onChange.emit(new TimeRangeComponentEvent({
			'dateFrom': this._dateFrom,
			'dateTo': this._dateTo
		}));
	}

	public get dateTo() {
		return this._dateTo;
	}

	constructor() { }

	ngOnInit() {
	}

}
