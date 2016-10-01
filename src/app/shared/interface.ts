export interface IWebworkerEvent {
	data: any;
}

export interface IEvent {
	type: string;
	data: any;
}

export interface IInputDataItem {
	ArrivalTime: string;
	LeaveTime: string;
	Id: number;
}

export interface IChartItem {
	key: number;
	value: number;
}

export interface IRangeItem {
	from: number;
	to: number;
	total: number;
}

export interface IChartData {
	maxRanges: Array<IRangeItem>;
	maxCount: number;
	data: IChartItem[];
}
