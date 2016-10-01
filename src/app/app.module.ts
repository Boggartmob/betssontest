import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { AppComponent } from './components/app/app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ChartComponent } from './components/chart/chart.component';
import { InfoComponent } from './components/info/info.component';
import { TimeRangeComponent } from './components/time-range/time-range.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { Ng2DatetimePickerModule } from 'ng2-datetime-picker';

import { ParkingService } from './services/parking.service';
import { WebworkerService } from './services/webworker.service';


@NgModule({
	declarations: [
		ChartComponent,
		TimeRangeComponent,
		InfoComponent,
		NavigationComponent,
		AppComponent,
		SpinnerComponent
	],
	imports: [
		Ng2DatetimePickerModule,
		BrowserModule,
		FormsModule,
		HttpModule,
		JsonpModule
	],
	providers: [
		ParkingService,
		WebworkerService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
