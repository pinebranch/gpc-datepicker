import { createCustomElement } from '../lib/dom';
import CalendarView from './calendarView';
import { isValidDate } from '../lib/datetime';

export default class ViewMonths extends CalendarView
{
    constructor(picker: object, date: Date) {
        super(picker, date);
        this.type = 'months';
        this.navStep = 1;
        this.initViewElements();
    }

    initViewElements() {
        this.container.id = this.picker.host.getAttribute('id') + '-months';
        this.container.classList.add('view-months');

        this.elements.caption.innerHTML = this.picker.selectedDate.getFullYear();
    }

    render() {
        let _this = this;

        let thisYear = this.viewDate.getFullYear();
        this.elements.caption.innerHTML = thisYear;

        let months = this.picker.locale.months;

        this.elements.body.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            let elem = createCustomElement('span', { class: 'gpc-cal-month' }, months[i]);
            if (i === this.picker.selectedDate.getMonth() && this.picker.selectedDate.getFullYear() === thisYear) {
                elem.classList.add('selected');
            }

            if (this.isMonthDisabled(i, thisYear)) {
                elem.classList.add('disabled');
            } else {
                elem.addEventListener('click', function () {
                    _this.viewDate.setMonth(i);
                    _this.picker.changeView('days', _this.viewDate);
                });
            }

            this.elements.body.appendChild(elem);
        }
    }

    private isMonthDisabled(month: number, year: number) {
        let minDate = this.picker.options.minDate;
        let maxDate = this.picker.options.maxDate;
        if (isValidDate(minDate)) {
            if (
                (minDate.getMonth() > month && minDate.getFullYear() == year)
                || (minDate.getFullYear() > year)
            ) {
                return true;
            }
        }
        if (isValidDate(this.picker.options.maxDate)) {
            if (
                (maxDate.getMonth() < month && maxDate.getFullYear() == year)
                || (maxDate.getFullYear() < year)
            ) {
                return true;
            }
        }

        return false;
    }
}