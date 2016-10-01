export const CONFIG = {
	/**
	 * Use %DAYS_COUNT% and %ITEMS_COUNT% to set appropriate url values
	 */
	dataSourceURLPattern: 'https://parkingapi.gear.host/v1/parking?days=%DAYS_COUNT%&Items=%ITEMS_COUNT%&callback=JSONP_CALLBACK',
	defaultItemsToLoad: 100000,
	defaultDaysToLoad: 30,
	dateFormat: '%d-%m-%Y %H:%M'
};
