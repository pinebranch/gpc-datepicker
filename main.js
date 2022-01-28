
import DatePicker from './src/datepicker/datepicker.ts';

let datepicker = new DatePicker(document.getElementById('datepicker'));
let datepicker2 = new DatePicker(document.getElementById('datepicker2'));
let datepicker3 = new DatePicker(document.getElementById('datepicker3'), {format: 'MM-DD-YYYY'});
let datepicker4 = new DatePicker(document.getElementById('datepicker4'), {
	minDate: '3/1/2022',
	maxDate: '3/3/2022'
});
let datepicker5 = new DatePicker(document.getElementById('datepicker5'), {
	timepicker: {
		minHour: 8, //default: 0
		maxHour: 18, // default: 23
		minuteStep: 5 // default: 5
	}
});
let datepicker6 = new DatePicker(document.getElementById('datepicker6'), {
	timepicker: true,
	locale: 'en'
});
