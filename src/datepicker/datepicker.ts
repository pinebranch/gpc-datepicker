import '../datepicker.scss'

import { parseDate, formatDate, isValidDate } from '../lib/datetime';
import { locales } from './locales';
import { createCustomElement } from '../lib/dom';
import ViewDays from './viewdays';
import ViewMonths from './viewmonths';
import ViewYears from './viewyears';
import { uid } from '../lib/util';

export default class DatePicker {
    host: HTMLInputElement;
    options = {
        format: 'DD/MM/YYYY',
        initialDate: new Date(),
        minDate: null,
        maxDate: null,
        locale: 'vi',
        timepicker: null,
    };
    calendar: HTMLElement;
    isCalendarVisible = false;
    views: { days: ViewDays; months: ViewMonths; years: ViewYears; };
    currentView: string;
    selectedDate: Date;
    viewDate: Date;
    locale: any;
    defaultTimePickerOptions = {
        minHour: 0,
        maxHour: 23,
        minuteStep: 5
    };
    hasTimePicker: boolean;

    constructor(elem: HTMLInputElement, options: object) {
        this.host = elem;
        this.options = Object.assign(this.options, options);
        this.locale = locales[this.options.locale];

        if (this.options.timepicker != null && this.options.timepicker) {
            if (typeof this.options.timepicker !== 'object') {
                this.options.timepicker = {};
            }
            this.options.timepicker = Object.assign(this.defaultTimePickerOptions, this.options.timepicker);
            this.options.format += ' HH:mm';
            this.hasTimePicker = true;
        } else {
            this.hasTimePicker = false;
        }

        this.options.minDate = parseDate(this.options.minDate, this.options.format);
        this.options.maxDate = parseDate(this.options.maxDate, this.options.format);

        this.setHostAttributes();
        this.calendar = this.createCalendarElement();
        document.body.appendChild(this.calendar);

        this.selectedDate = this.getInitDateFromInput();
        this.viewDate = this.selectedDate;

        this.views = {
            days: new ViewDays(this, this.selectedDate),
            months: new ViewMonths(this, this.selectedDate),
            years: new ViewYears(this, this.selectedDate)
        }

        this.currentView = 'days';
    }

    private setHostAttributes() {
        let _this = this;
        this.host.setAttribute('autocomplete', 'off');
        this.host.setAttribute('inputmode', 'none');//prevent showing keyboard on mobile

        this.host.addEventListener('focus', e => {
            this.show('days');
        });

        this.host.addEventListener('change', function(e) {
            let value = (<HTMLInputElement>e.target).value;
            let date = parseDate(value, _this.options.format);
            if (isValidDate(date)) {
                _this.setDate(date);
            }
        })
    }

    private getInitDateFromInput() {
        if (this.host.value != '') {
            let value = this.host.value;
            if (this.options.timepicker) {
                if (value.indexOf(':') < 0) {
                    value += ' 00:00';
                }
            }
            let inputDate = parseDate(value, this.options.format);

            if(isValidDate(inputDate) && inputDate != this.options.initialDate) {
                return inputDate;
            }
        }
        return this.options.initialDate;
    }

    private createCalendarElement() {
        if (!this.host.id || this.host.id == '') {
            this.host.id = uid();
        }
        let calendar = createCustomElement('div', {
            class: 'gpc-calendar',
            id: this.host.id + '-calendar'
        });

        let _this = this;
        this.calendar = calendar;

        //hide calendar on click outside
        document.addEventListener('click', (event) => {
            const withinBoundaries = event.composedPath().includes(calendar)
            if (_this.isCalendarVisible) {
                if (!withinBoundaries && event.target != this.host) {
                    _this.hide();
                }
            }
        });

        return calendar;
    }

    hide() {
        this.isCalendarVisible = false;
        this.calendar.classList.remove('show');
    }

    show(view: string) {

        let { height, top, left } = this.host.getBoundingClientRect();
        let cRect = this.calendar.getBoundingClientRect();
        let y = top + scrollY;
        let x = left + scrollX;
        let offset = 4 + height;

        if (top + cRect.height + height > window.innerHeight) {
            offset = - 4 - cRect.height;
        }
        this.calendar.style.top = (y + offset) + 'px';
        this.calendar.style.left = x + 'px';

        //prevent calendar from being hidden when calendar's position overlap input
        setTimeout(() => {
            this.isCalendarVisible = true;
            this.calendar.classList.add('show');
        }, 200);

        this.changeView('days', this.selectedDate);
    }

    changeView(view: string, viewDate: Date) {
        this.views[this.currentView].show(false, viewDate);
        this.views[view].show(true, viewDate);
        this.currentView = view;
    }

    setDate(date: Date) {
        this.selectedDate = date;
        this.host.value = formatDate(date, this.options.format);
    }

    getDate() {
        return this.selectedDate;
    }

    destroy() {
        this.calendar.remove();
    }
}