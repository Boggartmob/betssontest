/// <reference path="../node_modules/@types/node/index.d.ts" />

import './polyfills.ts';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';
import {environment} from './environments/environment';
import {AppModule} from './app';

if (environment.production) {
	enableProdMode();
}

// DatePicker hack
window['moment'] = require('../node_modules/moment/moment.js');

platformBrowserDynamic().bootstrapModule(AppModule);
