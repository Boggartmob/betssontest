import { Component, OnInit, Input } from '@angular/core';

let d3 = require('../../../../node_modules/d3');

@Component({
	selector: 'app-info',
	templateUrl: './info.component.html',
	styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

	dateFormatter: any;

	@Input()
	maximumsData: any;

	constructor() {
		this.dateFormatter = d3.timeFormat('%x %H:%M');
	}

	ngOnInit() {
	}

}
