'use strict';

/**
 * Created by MyPC on 2017/6/12.
 */

let _extendObj = function() { };
let _newId = 0;

var objectUtil = {

    isBoolean: function(value) {
        return typeof value === 'boolean';
    },

    isString: function(value) {
        return typeof value === 'string';
    },

    isNumber: function(value) {
        return typeof value === 'number';
    },

    isDate: function(value) {
        return Object.prototype.toString.call(value) === '[object Date]';
    },

    isArray: Array.isArray,

    isFunction: function(value) {
        return typeof value === 'function';
    },

    // array and date is not object
    isObject: function(value) {
        return value !== null && typeof value === 'object' && !this.isDate(value) && !this.isArray(value);
    },

    isRegExp: function(value) {
        return Object.prototype.toString.call(value) === '[object RegExp]';
    },

    isPromise: function(value) {
        return Object.prototype.toString.call(value) === '[object Promise]';
    },

    extendObj: function(obj) {
        if (obj) {
            _extendObj.prototype = obj;
            return new _extendObj();
        } else {
            return {};
        }
    },

    getNewId: function(id) {
        if (this.isString(id)) {
            // 不能使用parseInt，parseInt只要id是数字开始，就会转换前面的数字部分。
            var n = Number(id);
            if (!isNaN(n)) {
                return n;
            }
        } else if (this.isNumber(id) && !isNaN(id)) {
            return id;
        }
        _newId--;
        return _newId;
    },

    getObjectId: function(obj) {
        var id;
        if (this.isObject(obj)) {
            id = obj.id;
            return this.isNumber(id) ? id : -1;
        } else if (this.isNumber(obj)) {
            return obj;
        } else if (this.isString(obj)) {
            id = Number(obj);
            return isNaN(id) ? -1 : id;
        } else {
            return -1;
        }
    },

    getObjectLabel: function(obj) {
        if (obj) {
            if (this.isString(obj)) {
                return obj;
            } else if (this.isObject(obj) && obj.label) {
                return obj.label;
            }
        }
        return '';
    },

    isEmptyValue: function(value) {
        return (value === undefined || value === null || value === '' ||
            (this.isNumber(value) && isNaN(value)) || (this.isArray(value) && value.length === 0));
    },

    getFieldValue: function(obj, field, start) {
        if (!obj || !field) {
            return obj;
        }
        if (this.isArray(field)) {
            if (!start) {
                start = 0;
            }
            if (field.length === start) {
                return obj;
            }
            if (obj.hasOwnProperty(field[0])) {
                return this.getFieldValue(obj[field[0]], field, start + 1);
            }
            return undefined;
        } else {
            let parts = field.split('.');
            return this.getFieldValue(obj, parts, start);
        }
    },

    // different from Object.assign, it's deep clone
    clone: function(src) {
        if (this.isDate(src)) {
            return new Date(src.getTime());
        }
        if (this.isRegExp(src)) {
            return new RegExp(src.source, src.toString().match(/[^\/]*$/)[0]);
        }
        let ret;
        let t = this;
        if (this.isArray(src)) {
            ret = [ ];
            src.forEach(function(item) {
                ret.push(t.clone(item));
            });
            return ret;
        }
        if (this.isObject(src)) {
            ret = { };
            Object.keys(src).forEach(function(key) {
                ret[key] = t.clone(src[key]);
            });
            return ret;
        }
        return src;
    },

    cloneFields: function(src, srcFields, dstFields) {
        let dst = { };
        if (src && srcFields && srcFields.length > 0) {
            srcFields.forEach(function(field, index) {
                let dst_field = dstFields ? dstFields[index] : field;
                dst[dst_field] = src[field];
            });
        }
        return dst;
    },

    // 复制src到dst。浅拷贝
    copy(src, dst, override) {
        if (!dst) {
            dst = {};
        }
        if (src) {
            Object.keys(src).forEach(attr => {
                if (override || dst[attr] === undefined) {
                    dst[attr] = src[attr];
                }
            });
        }
        return dst;
    },

    /** 生成工作对象
     *  首先复制persistence对象成work对象(浅拷贝)
     *  然后检查attrs，如果在work对象中不存在，从base对象中复制(浅拷贝)
     *
     * @param base 基对象
     * @param persistence 持久化对象
     * @param attrs 继承的属性列表
     *
     * @return 工作对象
     */
    createWorkObject(base, persistence, attrs) {
        let work = Object.assign({}, persistence);
        if (attrs && base) {
            attrs.forEach(function(attr) {
                if (work[attr] === undefined) {
                    work[attr] = base[attr];
                }
            });
        }
        return work;
    },

    /** 保存工作对象
     * 遍历work对象中所有属性：
     * 如果属性在attrs，检查该属性的值是否和base对象相同，如果相同，清除persistence对象中的该属性，如果不相同，复制到persistence对象中(浅拷贝)
     * 如果属性不在attrs中，直接复制到persistence对象中（浅拷贝)
     *
     * @param base 基对象
     * @param persistence 持久化对象
     * @param work 工作对象
     * @param attrs 继承的属性列表
     */
    persistWorkObject(base, persistence, work, attrs) {
        Object.keys(work).forEach(function(attr) {
            if (attrs && attrs.indexOf(attr) >= 0 && base[attr] === work[attr]) {
                delete persistence[attr];
            } else {
                persistence[attr] = work[attr];
            }
        });
    },

    ensureHasFields(obj, fields, value) {
        if (fields && obj) {
            fields.forEach(function(field) {
                if (!obj.hasOwnProperty(field)) {
                    obj[field] = value;
                }
            });
        }
    },

    safeExecFunction(func, ...params) {
        if (func) {
            func(...params);
        }
    }
};

/**
 * Created by MyPC on 2017/6/23.
 */

/** 格式
 * 日期和时间格式由日期和时间模式字符串指定。在日期和时间模式字符串中，未加引号的字母 'A' 到 'Z' 和 'a' 到 'z' 被解释为模式字母，用来表示日期或时间字符串元素。
 * 文本可以使用单引号 (') 引起来，以免进行解释。"''" 表示单引号。所有其他字符均不解释；只是在格式化时将它们简单复制到输出字符串，或者在解析时与输入字符串进行匹配。
 *
 * 定义了以下模式字母（所有其他字符 'A' 到 'Z' 和 'a' 到 'z' 都被保留）：
 * 字母 日期或时间元素         表示              示例
 * G    Era 标志符             Text              AD
 * y    年                     Year              1996; 96
 * M    年中的月份             Month             July; Jul; 07
 * w    年中的周数             Number            27
 * W    月份中的周数           Number            2
 * D    年中的天数             Number            189
 * d    月份中的天数           Number            10
 * F    月份中的星期           Number            2
 * E    星期中的天数           Text              Tuesday; Tue
 * a    Am/pm 标记             Text              PM
 * H    一天中的小时数(0-23)   Number            0
 * k    一天中的小时数(1-24)   Number            24
 * K    am/pm 中的小时数(0-11) Number            0
 * h    am/pm 中的小时数(1-12) Number            12
 * m    小时中的分钟数         Number            30
 * s    分钟中的秒数           Number            55
 * S    毫秒数                 Number            978
 * z    时区                   General time zone Pacific Standard Time; PST; GMT-08:00
 * Z    时区                   RFC 822 time zone -0800
 *
 * 模式字母通常是重复的，其数量确定其精确表示：
 * Text: 对于格式化来说，如果模式字母的数量大于等于 4，则使用完全形式；否则，在可用的情况下使用短形式或缩写形式。对于解析来说，两种形式都是可接受的，与模式字母的数量无关。
 * Number: 对于格式化来说，模式字母的数量是最小的数位，如果数位不够，则用 0 填充以达到此数量。对于解析来说，模式字母的数量被忽略，除非必须分开两个相邻字段。
 * Year: 如果格式器的 Calendar 是格里高利历，则应用以下规则。
 *       对于格式化来说，如果模式字母的数量为 2，则年份截取为 2 位数,否则将年份解释为 number。
 *       对于解析来说，如果模式字母的数量大于 2，则年份照字面意义进行解释，而不管数位是多少。因此使用模式 "MM/dd/yyyy"，将 "01/11/12" 解析为公元 12 年 1 月 11 日。
 *       在解析缩写年份模式（"y" 或 "yy"）时，必须相对于某个世纪来解释缩写的年份。世纪为解析发生时间之前的 80 年和之后 20 年范围内来完成。
 *       例如，在 "MM/dd/yy" 模式下，如果解析发生在1997 年 1 月 1 日，则字符串 "01/11/12" 将被解释为 2012 年 1 月 11 日，而字符串 "05/04/64" 将被解释为 1964 年 5 月 4 日。
 *       在解析时，只有恰好由两位数字组成的字符串（如 Character#isDigit(char) 所定义的）被解析为默认的世纪。
 *       其他任何数字字符串将照字面意义进行解释，例如单数字字符串，3 个或更多数字组成的字符串，或者不都是数字的两位数字字符串（例如"-1"）。
 *       因此，在相同的模式下， "01/02/3" 或 "01/02/003" 解释为公元 3 年 1 月 2 日。同样，"01/02/-3" 解析为公元前 4 年 1 月 2 日。
 *       如果格式器的 Calendar 不是格里高利历，则应用日历系统特定的形式。
 *       对于格式化和解析，如果模式字母的数量为 4 或大于 4，则使用日历特定的 long form。否则，则使用日历特定的 short or abbreviated form。
 * Month: 如果模式字母的数量为 3 或大于 3，则将月份解释为 text；否则解释为 number。
 *
 * 以下示例显示了如何在美国语言环境中解释日期和时间模式。给定的日期和时间为美国太平洋时区的本地时间 2001-07-04 12:08:56。
 * "yyyy.MM.dd G 'at' HH:mm:ss z"：2001.07.04 AD at 12:08:56 PDT
 * "EEE, MMM d, ''yy"：Wed, Jul 4, '01
 * "h:mm a"：12:08 PM
 * "hh 'o''clock' a, zzzz"：12 o'clock PM, Pacific Daylight Time
 * "K:mm a, z"：0:08 PM, PDT
 * "yyyyy.MMMMM.dd GGG hh:mm aaa"：02001.July.04 AD 12:08 PM
 * "EEE, d MMM yyyy HH:mm:ss Z"：Wed, 4 Jul 2001 12:08:56 -0700
 * "yyMMddHHmmssZ"：010704120856-0700
 * "yyyy-MM-dd'T'HH:mm:ss.SSSZ"：2001-07-04T12:08:56.235-0700
 */

// const MS_IN_SECOND = 1000;
// const MS_IN_MINUTE = 60000;
// const MS_IN_HOUR = 3600000;
const MS_IN_DAY = 86400000;
const MS_IN_WEEK = 604800000;

const _LOCALE_TEMPLS = {
    en_US: {
        MONTH_FULL_NAMES: [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
        ],
        MONTH_ABBREVIATIONS: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        DAY_FULL_NAMES: [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ],
        DAY_ABBREVIATIONS: [
            'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
        ],
        AM_PM_FLAGS: [
            'AM', 'PM'
        ]
    },
    zh_CN: {
        MONTH_FULL_NAMES: [
            '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'
        ],
        MONTH_ABBREVIATIONS: [
            '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'
        ],
        DAY_FULL_NAMES: [
            '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
        ],
        DAY_ABBREVIATIONS: [
            '周日', '周一', '周二', '周三', '周四', '周五', '周六'
        ],
        AM_PM_FLAGS: [
            '上午', '下午'
        ]
    }
};

let _locale = 'zh_CN';
let _localeTempl = _LOCALE_TEMPLS.zh_CN;

function _convertNumberByPattern(num, counter) {
    let ret = num.toString();
    if (counter === 2) {
        return ret.padStart(2, '0');
    }
    return ret;
}

const PATTERN_PROCESSORS = {
    // year
    y: function(date, counter) {
        let ret = date.getFullYear().toString();
        if (counter === 2) {
            return ret.substring(ret.length - 2);
        }
        return ret;
    },
    // month
    M: function(date, counter) {
        // Date.getMonth返回月份，0-11表示一月到12月
        let month = date.getMonth();
        if (counter >= 4) {
            return _localeTempl.MONTH_FULL_NAMES[month];
        } else if (counter === 3) {
            return _localeTempl.MONTH_ABBREVIATIONS[month];
        } else {
            return _convertNumberByPattern(month + 1, counter);
        }
    },
    // week in year
    w: function(date, counter, dateUtil) {
        return _convertNumberByPattern(dateUtil.getWeekInYear(date), counter);
    },
    // week in month
    W: function(date, counter, dateUtil) {
        return _convertNumberByPattern(dateUtil.getWeekInMonth(date), counter);
    },
    // date in year
    D: function(date, counter, dateUtil) {
        return _convertNumberByPattern(dateUtil.getDateInYear(date), counter);
    },
    // date
    d: function(date, counter) {
        // Date.getDate返回日期，1-31表示1号到31号
        return _convertNumberByPattern(date.getDate(), counter);
    },
    // week in month
    F: function(date, counter, dateUtil) {
        return _convertNumberByPattern(dateUtil.getWeekInMonth(date), counter);
    },
    // day
    E: function(date, counter) {
        // Date.getDay返回星期几，0-6表示周日到周六
        let d = date.getDay();
        if (counter >= 4) {
            return _localeTempl.DAY_FULL_NAMES[d];
        }
        return _localeTempl.DAY_ABBREVIATIONS[d];
    },
    // am/pm
    a: function(date) {
        return _localeTempl.AM_PM_FLAGS[(date.getHours() < 12) ? 0 : 1];
    },
    // hour(0-23)
    H: function(date, counter) {
        return _convertNumberByPattern(date.getHours(), counter);
    },
    // hour(1-24)
    k: function(date, counter) {
        let h = date.getHours();
        if (h === 0) {
            h = 24;
        }
        return _convertNumberByPattern(h, counter);
    },
    // hour(0-11)
    K: function(date, counter) {
        let h = date.getHours();
        if (h > 11) {
            h -= 12;
        }
        return _convertNumberByPattern(h, counter);
    },
    // hour(1-12)
    h: function(date, counter) {
        let h = date.getHours();
        if (h > 12) {
            h -= 12;
        } else if (h === 0) {
            h = 12;
        }
        return _convertNumberByPattern(h, counter);
    },
    // minute
    m: function(date, counter) {
        return _convertNumberByPattern(date.getMinutes(), counter);
    },
    // second
    s: function(date, counter) {
        return _convertNumberByPattern(date.getSeconds(), counter);
    },
    // millisecond
    S: function(date, counter) {
        return _convertNumberByPattern(date.getMilliseconds(), counter);
    }
};

const _PARSE_IN_JSON_REGEXP = /([\d]{4})\-([\d]{2})\-([\d]{2})T([\d]{2})\:([\d]{2})\:([\d]{2})\.([\d]{3})Z/;

var dateUtil = {
    // 设置语言，目前只支持en_US和zh_CN两种。
    setLocale: function(locale) {
        _locale = locale;
        _localeTempl = _LOCALE_TEMPLS[locale];
    },

    getLocale: function() {
        return _locale;
    },

    // 2017-06-24T03:23:13.617Z
    formatByIso8601: function(date) {
        return (date.getUTCFullYear().toString().padStart(4, '0') + '-' + (date.getUTCMonth() + 1).toString().padStart(2, '0') +
                '-' + date.getUTCDate().toString().padStart(2, '0') + 'T' + date.getUTCHours().toString().padStart(2, '0') +
                ':' + date.getUTCMinutes().toString().padStart(2, '0') + ':' + date.getUTCSeconds().toString().padStart(2, '0') +
                '.' + date.getUTCMilliseconds().toString().padStart(3, '0') + 'Z');
    },

    parseByIso8601: function(str) {
        if (objectUtil.isString(str) && str.length === 24) {
            let ret = _PARSE_IN_JSON_REGEXP.exec(str);
            if (ret) {
                // 注意：按照标准时区构建时间。在json中传递的时间都是标准时区时间
                return new Date(Date.UTC(parseInt(ret[1], 10), parseInt(ret[2], 10) - 1, parseInt(ret[3], 10),
                    parseInt(ret[4], 10), parseInt(ret[5], 10), parseInt(ret[6], 10), parseInt(ret[7], 10)));
            }
        }
        return str;
    },

    parseDateInJson: function(obj) {
        if (obj === undefined || obj === null) {
            return obj;
        }
        let t = this;
        if (objectUtil.isArray(obj)) {
            obj.forEach(function(item, index) {
                obj[index] = t.parseDateInJson(item);
            });
        } else if (objectUtil.isObject(obj)) {
            Object.keys(obj).forEach(function(key) {
                obj[key] = t.parseDateInJson(obj[key]);
            });
        } else {
            return this.parseByIso8601(obj);
        }
        return obj;
    },

    format: function(date, fmt) {
        if (!date) {
            return '';
        }
        if (!fmt || fmt === 'dateTime') {
            fmt = 'yyyy-MM-dd HH:mm:ss';
        } else if (fmt === 'date') {
            fmt = 'yyyy-MM-dd';
        } else if (fmt === 'time') {
            fmt = 'HH:mm:ss';
        }

        let c, pattern_c, pattern_c_counter;
        let ret = '';
        let in_str = false;
        for (let i = 0; i < fmt.length; i++) {
            c = fmt[i];
            if (in_str) {
                if (c === "'") {
                    // judge if single quoto
                    if (i !== (fmt.length - 1) && fmt[i + 1] === "'") {
                        ret += "'";
                        i++;
                    } else {
                        // string closed
                        in_str = false;
                    }
                } else {
                    ret += c;
                }
            } else if (pattern_c === c) {
                pattern_c_counter++;
            } else {
                // process pattern
                if (pattern_c) {
                    ret += PATTERN_PROCESSORS[pattern_c](date, pattern_c_counter, this);
                    pattern_c = null;
                }
                // judge if c is pattern char
                if (PATTERN_PROCESSORS[c]) {
                    pattern_c = c;
                    pattern_c_counter = 1;
                } else {
                    ret += c;
                }
            }
        }
        if (pattern_c) {
            ret += PATTERN_PROCESSORS[pattern_c](date, pattern_c_counter, this);
        }
        return ret;
    },

    /** 返回指定时间是所在年的第几天。1月1号为该年的第1天。
     *
     * @param date 指定时间
     */
    getDateInYear: function(date) {
        let t = date.getTime() - this.getYearStart(date).getTime();
        return (Math.floor(t / MS_IN_DAY) + 1);
    },

    /** 返回指定时间是所在年的第几周。每周从周日开始。1月1号为该年的第1周。注意：每年的第1周可能是不完整周，计算时要注意。参考excel
     *
     * @param date 指定时间
     */
    getWeekInYear: function(date) {
        let first_day = this.getYearStart(date);
        let t = date.getTime() - first_day.getTime() + first_day.getDay() * MS_IN_DAY;
        return (Math.floor(t / MS_IN_WEEK) + 1);
    },

    /** 返回指定时间是所在月的第几周。每周从周日开始。每月1号为该月的第1周。注意：每月的第1周可能是不完整周，计算时要注意。
     *
     * @param date 指定时间
     */
    getWeekInMonth: function(date) {
        let first_day = this.getMonthStart(date);
        return (this.getWeekInYear(date) - this.getWeekInYear(first_day) + 1);
    },

    getYearStart: function(date) {
        return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
    },

    getMonthStart: function(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    },

    getDateStart: function(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    },

    getHourStart: function(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
    }
};

/**
 * Created by MyPC on 2017/6/14.
 */

const INT_REGEX = /^[\d]+$/;
const NUMBER_REGEX = /^[\d]+\.?[\d]*$/;
const NUM_IN_STYLE_REGEX = /^[\d]+(%|px)?$/;

var stringUtil = {

    /** 首字母大写 */
    capitalize: function(str) {
        if (str) {
            return str[0].toUpperCase() + str.substring(1);
        }
        return str;
    },

    /**
     * 去掉
     * @param str
     */
    removeBlankInEnd(str) {
        if (str) {
            let i;
            let start = -1;
            let str_len = str.length;
            for (i = 0; i < str_len; i++) {
                if (str[i] !== ' ') {
                    start = i;
                    break;
                }
            }
            // 所有字符都是空格
            if (start === -1) {
                return '';
            }
            let end = -1;
            for (i = str_len - 1; i > start; i--) {
                if (str[i] !== ' ') {
                    end = i;
                    break;
                }
            }
            return (end === -1) ? str[start] : str.substring(start, end + 1);
        }
        return str;
    },

    parseJsonValue(str) {
        if (objectUtil.isString(str)) {
            let value = this.removeBlankInEnd(str);
            if (value === 'undefined') {
                return undefined;
            } else if (value === 'null') {
                return null;
            } else if (value === 'true' || value === 'false') {
                return (value === 'true');
            } else if (this.isNumber(value)) {
                if (value.indexOf('.') >= 0) {
                    return parseFloat(value);
                } else {
                    return parseInt(value, 10);
                }
            } else if (value) {
                // 去掉字符串首尾标记
                if (value.length > 1 &&
                    ((value[0] === "'" && value[value.length - 1] === "'") ||
                    (value[0] === '"' && value[value.length - 1] === '"'))) {
                    value = value.substring(1, value.length - 1);
                }
                // 判断是否日期
                return dateUtil.parseByIso8601(value);
            } else {
                return value;
            }
        }
        return str;
    },

    serializeJsonValue(value) {
        if (value === undefined) {
            return 'undefined';
        } else if (value === null) {
            return 'null';
        } else if (objectUtil.isBoolean(value) || objectUtil.isNumber(value)) {
            return value.toString();
        } else if (objectUtil.isString(value)) {
            return "'" + value + "'";
        } else if (objectUtil.isDate(value)) {
            return "'" + dateUtil.formatInJson(value) + "'";
        } else {
            return '';
        }
    },

    // parse字符串类似a=b&c=d
    parseUrlPara(str) {
        let obj = {};
        if (str) {
            let t = this;
            let parts = str.split('&');
            parts.forEach(part => {
                let pos = part.indexOf('=');
                if (pos > 0) {
                    let attr = part.substring(0, pos);
                    let value = part.substring(pos + 1);
                    obj[t.removeBlankInEnd(attr)] = t.parseJsonValue(value);
                }
            });
        }
        return obj;
    },

    // parse字符串类似a: b; c: d
    parseStyle(str) {
        let obj = {};
        if (str) {
            let t = this;
            let parts = str.split(';');
            parts.forEach(part => {
                let pos = part.indexOf(':');
                if (pos > 0) {
                    let attr = part.substring(0, pos);
                    let value = part.substring(pos + 1);
                    obj[t.removeBlankInEnd(attr)] = t.removeBlankInEnd(value);
                }
            });
        }
        return obj;
    },

    serializeStyle(style) {
        let str = '';
        if (style) {
            Object.keys(style).forEach(attr => {
                str += attr + ':' + style[attr] + ';';
            });
        }
        return str;
    },

    // 和JSON.parse的区别在于：
    //  1. key可以不用"包括起来，string类型的value也可以使用'包括。
    //  2. 可以转换数组，例如：[ 1, 2, 3, ]
    //  3. 对于不是对象，也不是数组的字符串，会自动加{}，按照对象转换。
    // 注意：此函数有JSON劫持问题，所以只能解析内部定义，不能解析用户输入。
    parseJsonLikeObject: function(str) {
        // 判断str是否以{或者[开头
        var ret = /([^ \t\r\n])/.exec(str);
        if (ret) {
            if (ret[1] !== '{' && ret[1] !== '[') {
                str = '{' + str + '}';
            }
            try {
                return eval('(' + str + ')');
            } catch (e) {
                console.error('parse string error: ' + str);
                return null;
            }
        }
        return null;
    },

    split: function(str, sep) {
        let ret = [ ];
        if (str) {
            if (sep) {
                if (sep.length === 1) {
                    ret = str.split(sep);
                } else {
                    let start = 0;
                    for (let i = 0; i < str.length; i++) {
                        if (sep.indexOf(str[i]) >= 0) {
                            ret.push(str.substring(start, i));
                            start = i + 1;
                        }
                    }
                    if (start < str.length) {
                        ret.push(str.substring(start));
                    }
                }
            } else {
                ret.push(str);
            }
        }
        return ret;
    },

    isInt(str) {
        return (objectUtil.isString(str) && INT_REGEX.test(str));
    },

    isNumber(str) {
        return (objectUtil.isString(str) && NUMBER_REGEX.test(str));
    },

    isNumberInStyle(str) {
        return (objectUtil.isString(str) && NUM_IN_STYLE_REGEX.test(str));
    },

    /**
     * 对象串行化输出。注意：属性中'$$'开头的属性为内部属性，不输出。
     * @param obj
     * @param addObjectBracket
     * @param attrOutput 每个属性是否输出。undefined/true，输出；false，不输出；string，按照新名字输出。只在obj是对象时才有意义。
     * @returns {string}
     */
    serializeEleAttr: function(obj, addObjectBracket, attrOutput) {
        let str = '';
        if (obj !== undefined) {
            let t = this;
            if (objectUtil.isArray(obj)) {
                str += '[ ' + obj.map(item => {
                        return t.serializeEleAttr(item, true);
                    }).join(', ') + ' ]';
            } else if (objectUtil.isObject(obj)) {
                if (addObjectBracket) {
                    str = '{ ';
                }
                let is_first = true;
                Object.keys(obj).forEach(function(key) {
                    // 属性中'$$'开头的属性为内部属性，不输出。
                    if (key.substring(0, 2) !== '$$' && obj[key] !== undefined) {
                        let output_key = key;
                        if (attrOutput) {
                            if (attrOutput[key] === false) {
                                return;
                            } else if (objectUtil.isString(attrOutput[key])) {
                                output_key = attrOutput[key];
                            }
                        }
                        if (!is_first) {
                            str += ', ';
                        }
                        is_first = false;
                        str += output_key + ': ' + t.serializeEleAttr(obj[key], true);
                    }
                });
                if (addObjectBracket) {
                    str += ' }';
                }
            } else {
                str += this.serializeJsonValue(obj);
            }
        }
        return str;
    }
};

var buildIndex = {
    stringUtil,
    objectUtil
};

module.exports = buildIndex;
