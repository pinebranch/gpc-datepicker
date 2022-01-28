import { isValidDate } from '../lib/datetime';
import { createCustomElement } from '../lib/dom';
import CalendarView from './calendarView';

export default class ViewYears extends CalendarView
{
    constructor(picker: object, date: Date) {
        super(picker, date);
        this.type = 'years';
        this.navStep = 10;
        this.initViewElements();
    }

    initViewElements() {
        let _this = this;
        this.container.id = this.picker.host.getAttribute('id') + '-years';
        this.container.classList.add('view-years');

        let yearsRange = this.getYearsRange(this.picker.selectedDate);
        this.elements.caption.innerHTML = `${yearsRange.start} - ${yearsRange.end}`;
    }

    render() {
        let _this = this;
        let yearsRange = this.getYearsRange(this.viewDate);
        this.elements.caption.innerHTML = `${yearsRange.start} - ${yearsRange.end}`;

        this.elements.body.innerHTML = '';
        for (let i = yearsRange.start - 1; i <= yearsRange.end; i++) {
            let elem = createCustomElement('span', { class: 'gpc-cal-year' }, i.toString());
            if (i === this.picker.selectedDate.getFullYear()) {
                elem.classList.add('selected');
            }

            if (this.isYearDisabled(i)) {
                elem.classList.add('disabled');
            } else {
                elem.addEventListener('click', function () {
                    _this.viewDate.setFullYear(i);
                    _this.picker.changeView('days', _this.viewDate);
                });
            }

            this.elements.body.appendChild(elem);
        }
    }

    private getYearsRange(date: Date) {
        let start = Math.floor(date.getFullYear() / 10) * 10;
        let end = start + 10;
        return { start, end };
    }

    private isYearDisabled(year: number) {
        let minDate = this.picker.options.minDate;
        let maxDate = this.picker.options.maxDate;
        if (isValidDate(minDate)) {
            if (minDate.getFullYear() > year) {
                return true;
            }
        }
        if (isValidDate(this.picker.options.maxDate)) {
            if (maxDate.getFullYear() < year) {
                return true;
            }
        }

        return false;
    }
}