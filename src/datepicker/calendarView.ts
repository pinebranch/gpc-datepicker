import { createCustomElement } from '../lib/dom';
import { template } from './template';
import { formatDate } from '../lib/datetime';

interface ViewElements {
    [key: string]: any
};

export default class CalendarView {
    type: string;
    viewDate: Date;
    container: HTMLElement;
    picker: any;
    elements: ViewElements;
    displayState: boolean;
    navStep: number;

    constructor(picker: any, date: Date) {
        this.picker = picker;
        this.viewDate = new Date(+date);//The unary plus (+) operator converts its operand to Number type.

        this.container = this.initView();
        this.picker.calendar.appendChild(this.container);
        this.elements = Object.assign({}, this.getViewElements());

        this.displayState = false;
    }

    initView() {
        return createCustomElement('div', { class: 'gpc-cal-view' }, template);
    }

    getViewElements() {
        let _this = this;

        let btnPrev = this.container.querySelector('.btn-prev') as HTMLElement;
        let btnNext = this.container.querySelector('.btn-next') as HTMLElement;
        let caption = this.container.querySelector('.gpc-cal-caption') as HTMLElement;
        let meta = this.container.querySelector('.gpc-cal-meta') as HTMLElement;
        let body = this.container.querySelector('.gpc-cal-body') as HTMLElement;
        let footer = this.container.querySelector('.gpc-cal-footer') as HTMLElement;

        let today = new Date();
        meta.classList.add('gpc-cal-meta-today');
        meta.innerHTML = this.picker.locale.today + ' ' + formatDate(today, this.picker.options.format);
        meta.addEventListener('click', function () {
            _this.picker.setDate(today);
            _this.viewDate = new Date(+today);
            _this.render();
        });

        btnPrev.addEventListener('click', function () {
            _this.btnNavEvent('prev');
        });

        btnNext.addEventListener('click', function () {
            _this.btnNavEvent('next');
        });

        return { btnPrev, btnNext, caption, meta, body, footer };
    }

    show(state: boolean, viewDate: Date): void {
        this.displayState = state;
        this.viewDate = new Date(+viewDate);

        if (state) {
            this.container.classList.add('active');
            this.render();
        } else {
            this.container.classList.remove('active');
        }
    }

    protected btnNavEvent(navType: string): void {
        let step = navType === 'prev' ? this.navStep * (-1) : this.navStep;
        if (this.type === 'days') {
            this.viewDate.setMonth(this.viewDate.getMonth() + step);
        } else {
            this.viewDate.setFullYear(this.viewDate.getFullYear() + step);
        }
        this.render();
    }

    protected render() {
        //empty
    }
}