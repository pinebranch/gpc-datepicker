export { parseDate, formatDate, isValidDate, isSameDay }

/**
 * DateTime library
 * parser and formatter based on dayjs https://github.com/iamkun/dayjs
 */

const formattingTokens = /(\[[^[]*\])|([-:/.()\s]+)|(YYYY|YY?|MM?M?M?|DD?|HH?|mm?)/g;
const match1to2 = /\d\d?/ // 0 - 99
const match4 = /\d{4}/ // 0000 - 9999

const FORMAT_DEFAULT = 'DD/MM/YYYY';
export const REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|H{1,2}|m{1,2}/g

const addInput = function (property) {
    return function (input) {
        input = Math.abs(input);
        this[property] = input
    }
}

const expressions = {
    D: [match1to2, addInput('day')],
    DD: [match1to2, addInput('day')],
    M: [match1to2, addInput('month')],
    MM: [match1to2, addInput('month')],
    YYYY: [match4, addInput('year')],
    H: [match1to2, addInput('hours')],
    h: [match1to2, addInput('hours')],
    HH: [match1to2, addInput('hours')],
    hh: [match1to2, addInput('hours')],
    m: [match1to2, addInput('minutes')],
    mm: [match1to2, addInput('minutes')],
}

const padStart = (string, length, pad) => {
    const s = String(string)
    if (!s || s.length >= length) return string
    return `${Array((length + 1) - s.length).join(pad)}${string}`
}

function makeParser(format) {
    const array = format.match(formattingTokens)
    const { length } = array
    for (let i = 0; i < length; i += 1) {
        const token = array[i]
        const parseTo = expressions[token]
        const regex = parseTo && parseTo[0]
        const parser = parseTo && parseTo[1]
        if (parser) {
            array[i] = { regex, parser }
        } else {
            array[i] = token.replace(/^\[|\]$/g, '')
        }
    }
    return function (input) {
        const time = {}
        for (let i = 0, start = 0; i < length; i += 1) {
            const token = array[i]
            if (typeof token === 'string') {
                start += token.length
            } else {
                const { regex, parser } = token
                const part = input.substr(start)
                const match = regex.exec(part)
                const value = match[0]
                parser.call(time, value)
                input = input.replace(value, '')
            }
        }
        return time
    }
}

function parseDate(input, format) {
    if (input instanceof Date) {
        return input;
    }
    try {
        const parser = makeParser(format)
        const {
            year, month, day, hours, minutes
        } = parser(input)
        const now = new Date()
        const d = day || ((!year && !month) ? now.getDate() : 1)
        const y = year || now.getFullYear()
        const h = hours || 0
        const m = minutes || 0
        let M = 0
        if (!(year && !month)) {
            M = month > 0 ? month - 1 : now.getMonth()
        }

        return new Date(y, M, d, h, m)
    } catch (e) {
        return new Date('') // Invalid Date
    }
}

function formatDate(date, formatStr) {

    let y = date.getFullYear();
    let M = date.getMonth();
    let D = date.getDate();
    let H = date.getHours()
    let m = date.getMinutes()

    const str = formatStr || FORMAT_DEFAULT

    const matches = {
        YY: String(y).slice(-2),
        YYYY: y,
        M: M + 1,
        MM: padStart(M + 1, 2, '0'),
        D: D,
        DD: padStart(D, 2, '0'),
        H: String(H),
        HH: padStart(H, 2, '0'),
        m: String(m),
        mm: padStart(m, 2, '0'),
    }

    return str.replace(REGEX_FORMAT, (match, $1) => $1 || matches[match]) // 'ZZ'
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}
function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth();
}