import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'app-spinner',
	templateUrl: './spinner.component.html',
	styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

	constructor() { }

	ngOnInit() {
	}
}
