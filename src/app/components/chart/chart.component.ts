import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { NavigationComponent } from '../navigation/navigation.component';
import { NavigationActions } from '../navigation/navigationActions';
import { NavigationComponentEvent, TimeRangeComponentEvent } from '../../shared/event';
import { ParkingService } from '../../services/parking.service';
import { IChartItem, IChartData, IRangeItem } from '../../shared/interface';
import { CONFIG } from "../../config";

let d3 = require('../../../../node_modules/d3');

@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'app-chart',
	templateUrl: './chart.component.html',
	styleUrls: ['./chart.component.css', './768.chart.component.css']
})
export class ChartComponent implements OnInit {
	itemsCount: any = 15;
	daysCount: any = 2;
	maximumsData = { maxCount: 0, ranges: [] };

	minDateTimestamp: number;
	maxDateTimestamp: number;

	loading: boolean = false;

	private _chartData: IChartItem[];
	private _allMaximumsData = { maxCount: 0, ranges: [] };
	private _svg: any;
	private _x: any;
	private _y: any;
	private _xAxis: any;
	private _yAxis: any;
	private _xAxisDateFormatter: any;
	private _fromToDateFormatter: any;
	private _line: any;
	private _transition: any;

	private _axisMarginTop = 40;
	private _axisMarginLeft = 60;
	private _xAxisWidth = 560;
	private _svgHeight = 420;

	@Input()
	controls: NavigationComponent;

	constructor(private _parkingService: ParkingService) {
		this._parkingService.setDataLoadParams(200000, 60);

		this._fromToDateFormatter = d3.timeFormat(CONFIG.dateFormat);
		this._xAxisDateFormatter = d3.timeFormat('%_d %b %y');
		this._chartData = [];
		this._transition = d3.transition()
				.duration(200)
				.ease(d3.easeLinear);

		this._setScales();
		this._setAxis();
		this._setLine();
	}

	ngOnInit() {
		this.controls.onChange.subscribe(this.handleAction.bind(this));
		this._setSVG();
	}

	private _setSVG() {
		this._svg = d3.select('.chart-content').append('svg')
			.attr('width', '100%')
			.attr('height', this._svgHeight)
			.append('g')
			.attr('transform',
				'translate(' + 0 + ',' + 0 + ')');

		this._svg.append('clipPath')
			.attr('id', 'clip')
			.append('rect')
			.attr('width', this._xAxisWidth)
			.attr('height', this._svgHeight);

		this._svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(${this._axisMarginLeft},${300 + this._axisMarginTop})`)
			.call(this._xAxis);

		// Add the Y Axis
		this._svg.append('g')
			.attr('class', 'y axis')
			.attr('transform', `translate(${this._axisMarginLeft},${this._axisMarginTop})`)
			.call(this._yAxis);


		this._svg.append('path')
			.attr('class', 'line')
			.attr('clip-path', 'url(#clip)')
			.attr('transform', `translate(${this._axisMarginLeft},${this._axisMarginTop})`)
			.attr('d', this._line([]));
	}

	private _setScales() {
		this._x = d3.scaleLinear().range([0, this._xAxisWidth]);
		this._y = d3.scaleLinear().range([300, 0]);
		this._setDefaultDomain();
	}

	private _setDefaultDomain() {
		this._setDomain(
			d3.extent(this._chartData, function(d) { return d.key; }),
			[0, d3.max(this._chartData, function(d) { return d.value; })]
		);
	}

	private _setDomain(dx, dy) {
		this._setXDomain(dx);
		this._setYDomain(dy);
	}

	private _setXDomain(dx) {
		let dates = [];
		if (!dx[0] || !dx[1]) {
			let d = new Date();
			dates = [d, d];
		} else {
			dates = [new Date(dx[0] * 60000), new Date(dx[1] * 60000)];
		}

		this.maximumsData.ranges = [];

		this._allMaximumsData.ranges.forEach((range: IRangeItem) => {
			if (range.to > dx[0] * 60000 && range.from < dx[1] * 60000) {
				this.maximumsData.ranges.push(range);
			}
		});

		this.minDateTimestamp = this._fromToDateFormatter(dates[0]);
		this.maxDateTimestamp = this._fromToDateFormatter(dates[1]);
		this._x.domain(dx);
	}

	private _setYDomain(dy) {
		this._y.domain(dy);
	}

	private _setAxis() {
		this._xAxis = d3.axisBottom(this._x).ticks(5).tickFormat((x) => {
			if (x <= 1) { return ''; }
			return this._xAxisDateFormatter(new Date(parseInt(x, 10) * 60000));
		});

		this._yAxis = d3.axisLeft(this._y).ticks(3).tickFormat((y) => {
			if (y <= 1) { return ''; }
			return y;
		});
	}

	private _setLine() {
		this._line = d3.line()
			.x((d) => { return this._x(d.key); })
			.y((d) => { return this._y(d.value); });
	}

	private _drawChart(): void {
		try {
			this._svg.select('.line').transition(this._transition)
				.attr('d', this._line(this._chartData));
			this._svg.select('.x.axis').transition(this._transition)
				.call(this._xAxis);
			this._svg.select('.y.axis').transition(this._transition)
				.call(this._yAxis);
		} catch(e) {
			console.log(e);
		}

		this.loading = false;
	}

	private _setData(data: IChartData) {
		this._chartData = data.data;
		this._allMaximumsData = {
			maxCount: data.maxCount,
			ranges: data.maxRanges
		};

		this.maximumsData.maxCount = this._allMaximumsData.maxCount;
	}

	handleAction(event: NavigationComponentEvent) {

		this._parkingService.setDataLoadParams(parseInt(this.itemsCount, 10) || 1000, parseInt(this.daysCount, 10) || 10);

		if (event.action === NavigationActions.GET_DATA) {
			this.loading = true;
			this._parkingService.getChartDataFromApi().then((result: IChartData) => {
				this._setData(result);
				this._setDefaultDomain();
				this._drawChart();
			}, (error) => {

			});
		}

		if (event.action === NavigationActions.RESET_TIME_RANGE) {
			this._setXDomain(d3.extent(this._chartData, function(d) { return d.key; }));
			this._drawChart();
		}

		if (event.action === NavigationActions.LOAD_DATA) {
			this._parkingService.getChartDataFromCSV(event.data).then((result: IChartData) => {
				this._setData(result);
				this._setDefaultDomain();
				this._drawChart();
			}, (error) => {

			});
		}
	}

	dateChanged(event: TimeRangeComponentEvent) {
		let dateFrom = Math.round(event.data.dateFrom.getTime() / 60000);
		let dateTo = Math.round(event.data.dateTo.getTime() / 60000);
		this._setXDomain([dateFrom, dateTo]);
		this._drawChart();
	}
}
