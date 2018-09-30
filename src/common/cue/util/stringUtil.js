/**
 * Created by MyPC on 2017/6/14.
 */

import objectUtil from './objectUtil';
import dateUtil from './dateUtil';

const INT_REGEX = /^[\d]+$/;
const NUMBER_REGEX = /^[\d]+\.?[\d]*$/;
const NUM_IN_STYLE_REGEX = /^[\d]+(%|px)?$/;

export default {

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
                return eval('(' + str + ')');   // eslint-disable-line
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
