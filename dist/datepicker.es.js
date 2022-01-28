var datepicker = "";
const formattingTokens = /(\[[^[]*\])|([-:/.()\s]+)|(YYYY|YY?|MM?M?M?|DD?|HH?|mm?)/g;
const match1to2 = /\d\d?/;
const match4 = /\d{4}/;
const FORMAT_DEFAULT = "DD/MM/YYYY";
const REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|H{1,2}|m{1,2}/g;
const addInput = function(property) {
  return function(input) {
    input = Math.abs(input);
    this[property] = input;
  };
};
const expressions = {
  D: [match1to2, addInput("day")],
  DD: [match1to2, addInput("day")],
  M: [match1to2, addInput("month")],
  MM: [match1to2, addInput("month")],
  YYYY: [match4, addInput("year")],
  H: [match1to2, addInput("hours")],
  h: [match1to2, addInput("hours")],
  HH: [match1to2, addInput("hours")],
  hh: [match1to2, addInput("hours")],
  m: [match1to2, addInput("minutes")],
  mm: [match1to2, addInput("minutes")]
};
const padStart = (string, length, pad) => {
  const s = String(string);
  if (!s || s.length >= length)
    return string;
  return `${Array(length + 1 - s.length).join(pad)}${string}`;
};
function makeParser(format) {
  const array = format.match(formattingTokens);
  const { length } = array;
  for (let i = 0; i < length; i += 1) {
    const token = array[i];
    const parseTo = expressions[token];
    const regex = parseTo && parseTo[0];
    const parser = parseTo && parseTo[1];
    if (parser) {
      array[i] = { regex, parser };
    } else {
      array[i] = token.replace(/^\[|\]$/g, "");
    }
  }
  return function(input) {
    const time = {};
    for (let i = 0, start = 0; i < length; i += 1) {
      const token = array[i];
      if (typeof token === "string") {
        start += token.length;
      } else {
        const { regex, parser } = token;
        const part = input.substr(start);
        const match = regex.exec(part);
        const value = match[0];
        parser.call(time, value);
        input = input.replace(value, "");
      }
    }
    return time;
  };
}
function parseDate(input, format) {
  if (input instanceof Date) {
    return input;
  }
  try {
    const parser = makeParser(format);
    const {
      year,
      month,
      day,
      hours,
      minutes
    } = parser(input);
    const now = new Date();
    const d = day || (!year && !month ? now.getDate() : 1);
    const y = year || now.getFullYear();
    const h = hours || 0;
    const m = minutes || 0;
    let M = 0;
    if (!(year && !month)) {
      M = month > 0 ? month - 1 : now.getMonth();
    }
    return new Date(y, M, d, h, m);
  } catch (e) {
    return new Date("");
  }
}
function formatDate(date, formatStr) {
  let y = date.getFullYear();
  let M = date.getMonth();
  let D = date.getDate();
  let H = date.getHours();
  let m = date.getMinutes();
  const str = formatStr || FORMAT_DEFAULT;
  const matches = {
    YY: String(y).slice(-2),
    YYYY: y,
    M: M + 1,
    MM: padStart(M + 1, 2, "0"),
    D,
    DD: padStart(D, 2, "0"),
    H: String(H),
    HH: padStart(H, 2, "0"),
    m: String(m),
    mm: padStart(m, 2, "0")
  };
  return str.replace(REGEX_FORMAT, (match, $1) => $1 || matches[match]);
}
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();
}
const locales = {
  vi: {
    days: ["Ch\u1EE7 nh\u1EADt", "Th\u1EE9 hai", "Th\u1EE9 ba", "Th\u1EE9 t\u01B0", "Th\u1EE9 n\u0103m", "Th\u1EE9 s\xE1u", "Th\u1EE9 b\u1EA3y"],
    daysShort: ["CN", "Th\u1EE9 2", "Th\u1EE9 3", "Th\u1EE9 4", "Th\u1EE9 5", "Th\u1EE9 6", "Th\u1EE9 7"],
    daysMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    months: ["Th\xE1ng 1", "Th\xE1ng 2", "Th\xE1ng 3", "Th\xE1ng 4", "Th\xE1ng 5", "Th\xE1ng 6", "Th\xE1ng 7", "Th\xE1ng 8", "Th\xE1ng 9", "Th\xE1ng 10", "Th\xE1ng 11", "Th\xE1ng 12"],
    monthsShort: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
    today: "H\xF4m nay",
    clear: "X\xF3a",
    close: "\u0110\xF3ng",
    ok: "OK",
    format: "DD/MM/YYYY"
  },
  en: {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    today: "Today",
    clear: "Clear",
    close: "Close",
    ok: "OK",
    format: "DD/MM/YYYY"
  }
};
function createCustomElement(tag, attributes, content = "") {
  const element = document.createElement(tag);
  element.innerHTML = content;
  for (const name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  return element;
}
let template = `
    <div class="gpc-cal-header">
        <button class="btn-prev"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg></button>
        <span class="gpc-cal-caption"></span>
        <button class="btn-next"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg></button>
    </div>
    <div class="gpc-cal-meta"></div>
    <div class="gpc-cal-body"></div>
    <div class="gpc-cal-footer"></div>
`;
class CalendarView {
  constructor(picker, date) {
    this.picker = picker;
    this.viewDate = new Date(+date);
    this.container = this.initView();
    this.picker.calendar.appendChild(this.container);
    this.elements = Object.assign({}, this.getViewElements());
    this.displayState = false;
  }
  initView() {
    return createCustomElement("div", { class: "gpc-cal-view" }, template);
  }
  getViewElements() {
    let _this = this;
    let btnPrev = this.container.querySelector(".btn-prev");
    let btnNext = this.container.querySelector(".btn-next");
    let caption = this.container.querySelector(".gpc-cal-caption");
    let meta = this.container.querySelector(".gpc-cal-meta");
    let body = this.container.querySelector(".gpc-cal-body");
    let footer = this.container.querySelector(".gpc-cal-footer");
    let today = new Date();
    meta.classList.add("gpc-cal-meta-today");
    meta.innerHTML = this.picker.locale.today + " " + formatDate(today, this.picker.options.format);
    meta.addEventListener("click", function() {
      _this.picker.setDate(today);
      _this.viewDate = new Date(+today);
      _this.render();
    });
    btnPrev.addEventListener("click", function() {
      _this.btnNavEvent("prev");
    });
    btnNext.addEventListener("click", function() {
      _this.btnNavEvent("next");
    });
    return { btnPrev, btnNext, caption, meta, body, footer };
  }
  show(state, viewDate) {
    this.displayState = state;
    this.viewDate = new Date(+viewDate);
    if (state) {
      this.container.classList.add("active");
      this.render();
    } else {
      this.container.classList.remove("active");
    }
  }
  btnNavEvent(navType) {
    let step = navType === "prev" ? this.navStep * -1 : this.navStep;
    if (this.type === "days") {
      this.viewDate.setMonth(this.viewDate.getMonth() + step);
    } else {
      this.viewDate.setFullYear(this.viewDate.getFullYear() + step);
    }
    this.render();
  }
  render() {
  }
}
class ViewDays extends CalendarView {
  constructor(picker, date) {
    super(picker, date);
    this.type = "days";
    this.navStep = 1;
    this.initViewElements();
  }
  initViewElements() {
    let _this = this;
    this.container.id = this.picker.host.getAttribute("id") + "-days";
    this.container.classList.add("view-days");
    this.elements.captionMonth = createCustomElement("span", { class: "gpc-cal-caption-month gpc-cal-caption-button" });
    this.elements.captionMonth.addEventListener("click", function() {
      _this.picker.changeView("months", _this.viewDate);
    });
    this.elements.captionYear = createCustomElement("span", { class: "gpc-cal-caption-year gpc-cal-caption-button" });
    this.elements.captionYear.addEventListener("click", function() {
      _this.picker.changeView("years", _this.viewDate);
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
    let numberOfDays = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay();
    let daysList = [];
    for (let i = 0; i < startDay; i++) {
      daysList.push(0);
    }
    for (let i = 1; i <= numberOfDays; i++) {
      daysList.push(i);
    }
    this.elements.body.innerHTML = "";
    this.elements.body.appendChild(this.renderDaysName());
    let daysListEmelement = createCustomElement("div", { class: "gpc-cal-days-list" });
    for (let day of daysList) {
      let elem = document.createElement("span");
      if (day == 0) {
        elem.classList.add("gpc-cal-day-past");
      } else {
        let thisDate = new Date(year, month, day);
        elem.classList.add("gpc-cal-day", "gpc-cal-day-" + thisDate.getDay());
        if (isSameDay(today, thisDate)) {
          elem.classList.add("gpc-cal-today");
        }
        if (isValidDate(this.picker.selectedDate)) {
          if (isSameDay(this.picker.selectedDate, thisDate)) {
            elem.classList.add("selected");
          }
        }
        elem.innerText = `${day}`;
        if (this.isDateDisabled(thisDate)) {
          elem.classList.add("disabled");
        } else {
          elem.onclick = function() {
            if (_this.picker.hasTimePicker) {
              _this.setSelectedTime(thisDate);
            }
            _this.picker.setDate(thisDate);
            let oldSelected = _this.elements.body.querySelector(".selected");
            if (oldSelected) {
              oldSelected.classList.remove("selected");
            }
            elem.classList.add("selected");
            if (!_this.picker.hasTimePicker) {
              _this.picker.hide();
            }
          };
        }
      }
      daysListEmelement.appendChild(elem);
    }
    this.elements.body.appendChild(daysListEmelement);
    if (this.picker.hasTimePicker) {
      this.renderTimePicker();
    }
  }
  renderDaysName() {
    let daysName = this.picker.locale.daysMin;
    let elem = createCustomElement("div", { class: "gpc-cal-days-name" });
    for (let i = 0; i <= 6; i++) {
      let dayElem = createCustomElement("div", { class: "gpc-cal-day-" + i }, daysName[i]);
      elem.appendChild(dayElem);
    }
    return elem;
  }
  renderTimePicker() {
    let _this = this;
    let timePickerOpts = this.picker.options.timepicker;
    if (!this.picker.hasTimePicker) {
      return;
    }
    this.elements.footer.innerHTML = "";
    let timePickerWrapper = createCustomElement("div", { class: "gpc-cal-timepicker" });
    let selectHour = createCustomElement("select", { class: "gpc-cal-select gpc-cal-hours" });
    for (let i = timePickerOpts.minHour; i <= timePickerOpts.maxHour; i++) {
      let option = createCustomElement("option", { value: i }, i.toString().padStart(2, "0"));
      if (this.picker.selectedDate.getHours() === i) {
        option.selected = true;
      }
      selectHour.appendChild(option);
    }
    let selectMinute = createCustomElement("select", { class: "gpc-cal-select gpc-cal-minutes" });
    for (let i = 0; i < 60; i += timePickerOpts.minuteStep) {
      let option = createCustomElement("option", { value: i }, i.toString().padStart(2, "0"));
      if (this.picker.selectedDate.getMinutes() === i) {
        option.selected = true;
      }
      selectMinute.appendChild(option);
    }
    let buttonOk = createCustomElement("button", { class: "gpc-cal-btn gpc-cal-btn-ok" }, this.picker.locale.ok);
    buttonOk.addEventListener("click", function() {
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
  setSelectedTime(date) {
    let selectHours = this.elements.footer.querySelector(".gpc-cal-hours");
    let selectMinutes = this.elements.footer.querySelector(".gpc-cal-minutes");
    let selectedHours = selectHours.value;
    let selectedMinutes = selectMinutes.value;
    date.setHours(selectedHours);
    date.setMinutes(selectedMinutes);
  }
  isDateDisabled(date) {
    if (isValidDate(this.picker.options.minDate)) {
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
class ViewMonths extends CalendarView {
  constructor(picker, date) {
    super(picker, date);
    this.type = "months";
    this.navStep = 1;
    this.initViewElements();
  }
  initViewElements() {
    this.container.id = this.picker.host.getAttribute("id") + "-months";
    this.container.classList.add("view-months");
    this.elements.caption.innerHTML = this.picker.selectedDate.getFullYear();
  }
  render() {
    let _this = this;
    let thisYear = this.viewDate.getFullYear();
    this.elements.caption.innerHTML = thisYear;
    let months = this.picker.locale.months;
    this.elements.body.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      let elem = createCustomElement("span", { class: "gpc-cal-month" }, months[i]);
      if (i === this.picker.selectedDate.getMonth() && this.picker.selectedDate.getFullYear() === thisYear) {
        elem.classList.add("selected");
      }
      if (this.isMonthDisabled(i, thisYear)) {
        elem.classList.add("disabled");
      } else {
        elem.addEventListener("click", function() {
          _this.viewDate.setMonth(i);
          _this.picker.changeView("days", _this.viewDate);
        });
      }
      this.elements.body.appendChild(elem);
    }
  }
  isMonthDisabled(month, year) {
    let minDate = this.picker.options.minDate;
    let maxDate = this.picker.options.maxDate;
    if (isValidDate(minDate)) {
      if (minDate.getMonth() > month && minDate.getFullYear() == year || minDate.getFullYear() > year) {
        return true;
      }
    }
    if (isValidDate(this.picker.options.maxDate)) {
      if (maxDate.getMonth() < month && maxDate.getFullYear() == year || maxDate.getFullYear() < year) {
        return true;
      }
    }
    return false;
  }
}
class ViewYears extends CalendarView {
  constructor(picker, date) {
    super(picker, date);
    this.type = "years";
    this.navStep = 10;
    this.initViewElements();
  }
  initViewElements() {
    this.container.id = this.picker.host.getAttribute("id") + "-years";
    this.container.classList.add("view-years");
    let yearsRange = this.getYearsRange(this.picker.selectedDate);
    this.elements.caption.innerHTML = `${yearsRange.start} - ${yearsRange.end}`;
  }
  render() {
    let _this = this;
    let yearsRange = this.getYearsRange(this.viewDate);
    this.elements.caption.innerHTML = `${yearsRange.start} - ${yearsRange.end}`;
    this.elements.body.innerHTML = "";
    for (let i = yearsRange.start - 1; i <= yearsRange.end; i++) {
      let elem = createCustomElement("span", { class: "gpc-cal-year" }, i.toString());
      if (i === this.picker.selectedDate.getFullYear()) {
        elem.classList.add("selected");
      }
      if (this.isYearDisabled(i)) {
        elem.classList.add("disabled");
      } else {
        elem.addEventListener("click", function() {
          _this.viewDate.setFullYear(i);
          _this.picker.changeView("days", _this.viewDate);
        });
      }
      this.elements.body.appendChild(elem);
    }
  }
  getYearsRange(date) {
    let start = Math.floor(date.getFullYear() / 10) * 10;
    let end = start + 10;
    return { start, end };
  }
  isYearDisabled(year) {
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
function uid() {
  return (performance.now().toString(36) + Math.random().toString(36)).replace(/\./g, "");
}
class DatePicker {
  constructor(elem, options) {
    this.options = {
      format: "DD/MM/YYYY",
      initialDate: new Date(),
      minDate: null,
      maxDate: null,
      locale: "vi",
      timepicker: null
    };
    this.isCalendarVisible = false;
    this.defaultTimePickerOptions = {
      minHour: 0,
      maxHour: 23,
      minuteStep: 5
    };
    this.host = elem;
    this.options = Object.assign(this.options, options);
    this.locale = locales[this.options.locale];
    if (this.options.timepicker != null && this.options.timepicker) {
      if (typeof this.options.timepicker !== "object") {
        this.options.timepicker = {};
      }
      this.options.timepicker = Object.assign(this.defaultTimePickerOptions, this.options.timepicker);
      this.options.format += " HH:mm";
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
    };
    this.currentView = "days";
  }
  setHostAttributes() {
    let _this = this;
    this.host.setAttribute("autocomplete", "off");
    this.host.setAttribute("inputmode", "none");
    this.host.addEventListener("focus", (e) => {
      this.show("days");
    });
    this.host.addEventListener("change", function(e) {
      let value = e.target.value;
      let date = parseDate(value, _this.options.format);
      if (isValidDate(date)) {
        _this.setDate(date);
      }
    });
  }
  getInitDateFromInput() {
    if (this.host.value != "") {
      let value = this.host.value;
      if (this.options.timepicker) {
        if (value.indexOf(":") < 0) {
          value += " 00:00";
        }
      }
      let inputDate = parseDate(value, this.options.format);
      if (isValidDate(inputDate) && inputDate != this.options.initialDate) {
        return inputDate;
      }
    }
    return this.options.initialDate;
  }
  createCalendarElement() {
    if (!this.host.id || this.host.id == "") {
      this.host.id = uid();
    }
    let calendar = createCustomElement("div", {
      class: "gpc-calendar",
      id: this.host.id + "-calendar"
    });
    let _this = this;
    this.calendar = calendar;
    document.addEventListener("click", (event) => {
      const withinBoundaries = event.composedPath().includes(calendar);
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
    this.calendar.classList.remove("show");
  }
  show(view) {
    let { height, top, left } = this.host.getBoundingClientRect();
    let cRect = this.calendar.getBoundingClientRect();
    let y = top + scrollY;
    let x = left + scrollX;
    let offset = 4 + height;
    if (top + cRect.height + height > window.innerHeight) {
      offset = -4 - cRect.height;
    }
    this.calendar.style.top = y + offset + "px";
    this.calendar.style.left = x + "px";
    setTimeout(() => {
      this.isCalendarVisible = true;
      this.calendar.classList.add("show");
    }, 200);
    this.changeView("days", this.selectedDate);
  }
  changeView(view, viewDate) {
    this.views[this.currentView].show(false, viewDate);
    this.views[view].show(true, viewDate);
    this.currentView = view;
  }
  setDate(date) {
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
export { DatePicker as default };
