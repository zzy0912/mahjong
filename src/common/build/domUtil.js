let htmlparser2 = require('htmlparser2');
let cue = require('./cueUtil');

const INDENT_PER_LEVEL = '  ';

function _hasClass(ele, className) {
    if (ele.attribs.class) {
        return ((' ' + ele.attribs.class + ' ').indexOf(' ' + className + ' ') >= 0);
    } else {
        return false;
    }
}

let domUtil = {
    INDENT_PER_LEVEL,
    // 返回指定名字的元素
    getElesByName(eles, eleName) {
        return eles.filter(function(ele) {
            return (ele.type === 'tag' && ele.name === eleName);
        });
    },
    // 设置元素属性的缺省值
    setEleAttribDefaultValue(ele, attrName, defValue) {
        if (defValue !== undefined) {
            // 检查attrName，如果是'&'开头，表示设置样式
            if (attrName[0] === '&') {
                this.addStyle(ele, attrName.substring(1) + ':' + defValue, false);
            } else if (htmlparser2.DomUtils.hasAttrib(ele, attrName)) {
                if (attrName === 'class') {
                    this.addClass(ele, defValue);
                } else if (attrName === 'style') {
                    this.addStyle(ele, attrName + ':' + defValue, false);
                }
            } else {
                ele.attribs[attrName] = defValue;
            }
        }
    },
    hasClass: function(ele, className) {
        return _hasClass(ele, className);
    },
    addClass: function(ele, className) {
        if (!this.hasClass(ele, className)) {
            ele.attribs.class = ele.attribs.class ? (ele.attribs.class + ' ' + className) : className;
        }
    },
    addStyle: function(ele, style, override) {
        let old_style = ele.attribs.style;
        if (old_style) {
            old_style = cue.stringUtil.parseStyle(old_style);
            let new_style = cue.objectUtil.isString(style) ? cue.stringUtil.parseStyle(style) : style;
            cue.objectUtil.copy(new_style, old_style, override);
            ele.attribs.style = cue.stringUtil.serializeStyle(old_style);
        } else {
            ele.attribs.style = cue.objectUtil.isString(style) ? style : cue.stringUtil.serializeStyle(style);
        }
    },
    // 获取元素的前一个元素
    getPrevElement(ele) {
        let parent = ele.parent;
        if (parent) {
            let children = parent.children;
            if (children) {
                let pos = children.indexOf(ele);
                if (pos > 0) {
                    return children[pos - 1];
                }
            }
        }
        return null;
    },
    // 获取元素的缩进
    getEleIndent(ele) {
        let newline_ele = this.getPrevElement(ele);
        if (newline_ele && newline_ele.type === 'text') {
            return newline_ele.data;
        }
        return null;
    },
    // 创建元素节点
    createTagEle(name, attribs) {
        return { type: 'tag', name: name, attribs: attribs ? attribs : { }, children: [ ] };
    },
    // 创建文本节点
    createTextEle(text) {
        return { type: 'text', data: text };
    },
    // 在元素前插入缩进
    prependChildIndent(ele, indent) {
        if (indent) {
            htmlparser2.DomUtils.appendChild(ele, this.createTextEle(indent + INDENT_PER_LEVEL));
        }
    },
    // 在元素后插入缩进
    appendChildIndent(ele, indent) {
        if (indent) {
            htmlparser2.DomUtils.appendChild(ele, this.createTextEle(indent));
        }
    },
    // 在元素后插入一组元素
    append(ele, eles) {
        if (eles) {
            let cur_ele = ele;
            for (let i = 0; i < eles.length; i++) {
                htmlparser2.DomUtils.append(cur_ele, eles[i]);
                cur_ele = eles[i];
            }
        }
    }
};

module.exports = domUtil;
