/**
 * Created by MyPC on 2017/6/23.
 */

import objectUtil from './objectUtil';

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

export default {
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
