import { isSameDay, isValidDate } from '../lib/datetime';
import CalendarView from './calendarView';
import { createCustomElement } from '../lib/dom';

export default class ViewDays extends CalendarView
{
    constructor(picker: object, date: Date) {
        super(picker, date);
        this.type = 'days';
        this.navStep = 1;
        this.initViewElements();
    }

    initViewElements() {
        let _this = this;

        this.container.id = this.picker.host.getAttribute('id') + '-days';
        this.container.classList.add('view-days');

        this.elements.captionMonth = createCustomElement('span', { class: 'gpc-cal-caption-month gpc-cal-caption-button'})
        this.elements.captionMonth.addEventListener('click', function() {
            _this.picker.changeView('months', _this.viewDate);
        });

        this.elements.captionYear = createCustomElement('span', { class: 'gpc-cal-caption-year gpc-cal-caption-button' });
        this.elements.captionYear.addEventListener('click', function () {
            _this.picker.changeView('years', _this.viewDate);
        });

        this.elements.caption.appendChild(this.elements.captionMonth);
        this.elements.caption.appendChild(this.elements.captionYear);
    }

    render() {
        let _this = this;

        let monthsName = this.picker.locale.months;

        let today = new Date();
        let month = this.viewDate.getMonth();
        let year = this.viewDate.getFullYear();

        this.elements.captionMonth.innerText = monthsName[month];
        this.elements.captionYear.innerText = year.toString();

        let numberOfDays = new Date(year, month + 1, 0).getDate(); //28-31
        let startDay = new Date(year, month, 1).getDay(); // 0-6

        let daysList = [];

        //days of last month
        for (let i = 0; i < startDay; i++) {
            daysList.push(0);
        }

        //days of this month
        for (let i = 1; i <= numberOfDays; i++) {
            daysList.push(i);
        }

        this.elements.body.innerHTML = '';
        this.elements.body.appendChild(this.renderDaysName());

        let daysListEmelement = createCustomElement('div', { class: 'gpc-cal-days-list' });
        for (let day of daysList) {
            let elem = document.createElement('span');
            if (day == 0) {
                elem.classList.add('gpc-cal-day-past');
            } else {
                let thisDate = new Date(year, month, day);
                elem.classList.add('gpc-cal-day', 'gpc-cal-day-' + (thisDate.getDay()));

                if (isSameDay(today, thisDate)) {
                    elem.classList.add('gpc-cal-today');
                }
                if (isValidDate(this.picker.selectedDate)) {
                    if (isSameDay(this.picker.selectedDate, thisDate)) {
                        elem.classList.add('selected');
                    }
                }
                elem.innerText = `${day}`;

                if(this.isDateDisabled(thisDate)) {
                    elem.classList.add('disabled');
                } else {
                    elem.onclick = function () {
                        if (_this.picker.hasTimePicker) {
                            _this.setSelectedTime(thisDate);
                        }
                        _this.picker.setDate(thisDate);
                        let oldSelected = _this.elements.body.querySelector('.selected');
                        if (oldSelected) {
                            oldSelected.classList.remove('selected');
                        }
                        elem.classList.add('selected');
                        if (!_this.picker.hasTimePicker) {
                            _this.picker.hide();
                        }
                    }
                }
            }

            daysListEmelement.appendChild(elem);
        }

        this.elements.body.appendChild(daysListEmelement);

        if (this.picker.hasTimePicker) {
            this.renderTimePicker();
        }
    }

    private renderDaysName() {
        let daysName = this.picker.locale.daysMin;
        let elem = createCustomElement('div', { class: 'gpc-cal-days-name'});

        for(let i = 0; i <= 6; i++) {
            let dayElem = createCustomElement('div', { class: 'gpc-cal-day-' + i }, daysName[i]);
            elem.appendChild(dayElem);
        }
        return elem;
    }

    private renderTimePicker() {
        let _this = this;

        let timePickerOpts = this.picker.options.timepicker;
        if (!this.picker.hasTimePicker) {
            return;
        }

        this.elements.footer.innerHTML = '';

        let timePickerWrapper = createCustomElement('div', { class: 'gpc-cal-timepicker'});

        let selectHour = createCustomElement('select', { class: 'gpc-cal-select gpc-cal-hours' });
        for(let i = timePickerOpts.minHour; i <= timePickerOpts.maxHour; i++) {
            let option = createCustomElement('option', { value: i }, i.toString().padStart(2, '0'));
            if(this.picker.selectedDate.getHours() === i) {
                option.selected = true;
            }
            selectHour.appendChild(option);
        }

        let selectMinute = createCustomElement('select', { class: 'gpc-cal-select gpc-cal-minutes' });

        for (let i = 0; i < 60; i += timePickerOpts.minuteStep) {
            let option = createCustomElement('option', { value: i }, i.toString().padStart(2, '0'));
            if (this.picker.selectedDate.getMinutes() === i) {
                option.selected = true;
            }
            selectMinute.appendChild(option);
        }

        let buttonOk = createCustomElement('button', { class: 'gpc-cal-btn gpc-cal-btn-ok' }, this.picker.locale.ok);
        buttonOk.addEventListener('click', function() {
            let selectedDate = _this.picker.selectedDate;
            _this.setSelectedTime(selectedDate);
            _this.picker.setDate(selectedDate);
            _this.picker.hide();
        });

        timePickerWrapper.appendChild(selectHour);
        timePickerWrapper.appendChild(selectMinute);
        timePickerWrapper.appendChild(buttonOk);

        this.elements.footer.appendChild(timePickerWrapper);
    }

    private setSelectedTime(date: Date) {
        let selectHours = this.elements.footer.querySelector('.gpc-cal-hours');
        let selectMinutes = this.elements.footer.querySelector('.gpc-cal-minutes');

        let selectedHours = selectHours.value;
        let selectedMinutes = selectMinutes.value;

        date.setHours(selectedHours);
        date.setMinutes(selectedMinutes);
    }

    private isDateDisabled(date: Date) {
        if(isValidDate(this.picker.options.minDate)) {
            if (this.picker.options.minDate > date) {
                return true;
            }
        }
        if (isValidDate(this.picker.options.maxDate)) {
            if (this.picker.options.maxDate < date) {
                return true;
            }
        }

        return false;
    }
}