import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, ViewContainerRef } from '@angular/core';

import { NavigationActions } from './navigationActions';
import {NavigationComponentEvent} from '../../shared/event';

@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'app-navigation',
	templateUrl: './navigation.component.html',
	styleUrls: ['navigation.component.css', '768.navigation.component.css']
})
export class NavigationComponent implements OnInit {
	@Output()
	onChange = new EventEmitter<NavigationComponentEvent>();

	appName: string = 'Parking app';
	private _fileReader: any ;

	constructor(private _viewContainer: ViewContainerRef) {
		this._fileReader = new FileReader();
		this._fileReader.onload = this.loadData.bind(this);
	}

	ngOnInit() {
		let fileInput = this._viewContainer.element.nativeElement.querySelector('input[type="file"]');
		fileInput.addEventListener('change', (e) => {
			if (e.target.files.length > 0) {
				this._fileReader.readAsText(e.target.files[0]);
			}
		});
	}

	getData() {
		this.onChange.emit(new NavigationComponentEvent(NavigationActions.GET_DATA));
	}

	resetTime() {
		this.onChange.emit(new NavigationComponentEvent(NavigationActions.RESET_TIME_RANGE));
	}

	loadData(event = null) {
		let data = '';
		if (event) { data = event.target.result; }

		this.onChange.emit(new NavigationComponentEvent(NavigationActions.LOAD_DATA, data));
		let form = this._viewContainer.element.nativeElement.querySelector('form');
		form.reset();
	}
}
