/**
 * Created by MyPC on 2017/6/12.
 */

let _extendObj = function() { };
let _newId = 0;

export default {

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

    setFieldValue(obj, field, value, start) {
        if (!obj) {
            obj = {};
        }
        if (field) {
            if (this.isArray(field)) {
                if (!start) {
                    start = 0;
                }
                let key = field[start];
                if (start < (field.length - 1)) {
                    if (!obj[start]) {
                        obj[start] = {};
                    }
                    this.setFieldValue(obj[start], field, value, start + 1);
                } else {
                    obj[key] = value;
                }
            } else {
                let parts = field.split('.');
                this.setFieldValue(obj, parts, value, start);
            }
        }
        return obj;
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
            let key = field[start];
            return this.getFieldValue(obj[key], field, start + 1);
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
