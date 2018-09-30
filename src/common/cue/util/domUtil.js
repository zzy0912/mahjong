/**
 * Created by MyPC on 2017/6/14.
 */

import objectUtil from './objectUtil.js';

function _hasClass(ele, className) {
    if (ele.className) {
        return ((' ' + ele.className + ' ').indexOf(' ' + className + ' ') >= 0);
    } else {
        return false;
    }
}

function _getAttrValue(ele, attrName) {
    var attrs = ele.attributes;
    if (attrs) {
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            if (attr.nodeName === attrName) {
                return attr.nodeValue;
            }
        }
    }
    return undefined;
}

const SELECTOR_ATTR_OP_LIST = [ '|', '*', '~', '$', '!', '^' ];

function _parseSelector(selector) {
    var sel = { };
    if (!selector || selector === '*') {
        return sel;
    }
    // identify id
    if (selector[0] === '#') {
        sel.attrs = [ { name: 'id', op: '=', value: selector.substring(1) } ];
        return sel;
    }
    // identify nodeName and className
    var parts = selector.split('[');
    var part = parts[0];
    var pos;
    if (part) {
        pos = part.indexOf('.');
        if (pos >= 0) {
            sel.className = part.substring(pos + 1);
            if (pos > 0) {
                sel.nodeName = part.substring(0, pos);
            }
        } else {
            sel.nodeName = part;
        }
    }
    // 识别属性
    if (parts.length > 1) {
        sel.attrs = [ ];
        for (var i = 1; i < parts.length; i++) {
            var attr = { };
            part = parts[i];
            pos = part.indexOf('=');
            if (pos >= 0) {
                if (SELECTOR_ATTR_OP_LIST.indexOf(part[pos - 1]) >= 0) {
                    attr.name = part.substring(0, pos - 1);
                    attr.op = part.substring(pos - 1, pos + 1);
                } else {
                    attr.name = part.substring(0, pos);
                    attr.op = '=';
                }
                attr.value = part.substring(pos + 1);
            } else {
                attr.name = part;
            }
            sel.attrs.push(attr);
        }
    }
    return sel;
}

function _isMatchSelector(ele, selector) {
    // match node name
    if (selector.nodeName) {
        // ignore case
        if (ele.nodeName.toUpperCase() !== selector.nodeName.toUpperCase()) {
            return false;
        }
    }
    // match class name
    if (selector.className) {
        if (!_hasClass(ele, selector.className)) {
            return false;
        }
    }
    // match attr
    if (selector.attrs) {
        for (var i = 0; i < selector.attrs.length; i++) {
            var attr = selector.attrs[i];
            var attr_value = _getAttrValue(ele, attr.name);
            if (attr.op === '=') {
                // equal
                if (attr_value !== attr.value) {
                    return false;
                }
            } else if (attr.op === '|=') {
                // equal or start with and followed by '-'
                if (attr_value !== attr.value && (!attr_value || attr_value.substring(0, attr.value.length + 1) !== (attr.value + '-'))) {
                    return false;
                }
            } else if (attr.op === '*=') {
                // include
                if (!attr_value || attr_value.indexOf(attr.value) < 0) {
                    return false;
                }
            } else if (attr.op === '~=') {
                // include by split with ' '
                if (!attr_value || attr_value.split(' ').indexOf(attr.value) < 0) {
                    return false;
                }
            } else if (attr.op === '$=') {
                // end with
                if (!attr_value || attr_value.lastIndexOf(attr.value) !== (attr_value.length - attr.value.length)) {
                    return false;
                }
            } else if (attr.op === '!=') {
                // not equal
                if (attr_value === attr.value) {
                    return false;
                }
            } else if (attr.op === '^=') {
                // start with
                if (!attr_value || attr_value.indexOf(attr.value) !== 0) {
                    return false;
                }
            } else {
                // has attr
                if (attr_value === undefined) {
                    return false;
                }
            }
        }
    }
    return true;
}

/** 遍历dom树
 *
 * @param root dom树的根
 * @param handler 处理dom树的元素。function(ele)。返回0或者undefined表示继续遍历，返回-1表示不搜索子元素，返回-2表示退出遍历。
 * @param selector 判断当前元素是否需要处理。
 * @private
 */
function _traverseDomTree(root, handler, selector) {
    if (root) {
        let ret = 0;
        if (!selector || _isMatchSelector(root, selector)) {
            ret = handler(root);
        }
        if (!ret) {
            var children = root.childNodes;
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    if (_traverseDomTree(children[i], handler, selector) === -2) {
                        ret = -2;
                        break;
                    }
                }
            }
        }
        return ret;
    }
}

const STYLE_PX_ATTRS = [ 'fontSize', 'width', 'height', 'left', 'top', 'right', 'bottom' ];
const STYLE_PX_PREFIX_ATTRS = [ 'margin', 'padding' ];

let _inBrowser = (typeof window !== 'undefined');
let _userAgent = _inBrowser ? window.navigator.userAgent.toLowerCase() : null;
let _isEdge = _userAgent && _userAgent.indexOf('edge/') > 0;

export default {
    inBrowser: _inBrowser,
    userAgent: _userAgent,
    isIE: _userAgent && /msie|trident/.test(_userAgent), // ie6-10包含了msie，ie11包含了trident
    isEdge: _isEdge,
    isAndroid: _userAgent && _userAgent.indexOf('android') > 0,
    isIOS: _userAgent && /iphone|ipad|ipod|ios/.test(_userAgent),
    isChrome: _userAgent && !_isEdge && /chrome\/\d+/.test(_userAgent),
    isOpera: _userAgent && (_userAgent.indexOf('opera') >= 0),
    isFirefox: _userAgent && (_userAgent.indexOf('firefox') >= 0),

    /*
     * 获取当前IE版本。如果不是IE，返回0。
     */
    getIEVersion() {
        if (this.isIE) {
            let regex = /msie (\d+\.\d+)/;
            let ret = regex.exec(_userAgent);
            if (ret) {
                return parseFloat(ret[1]);
            } else {
                return 11.0;
            }
        } else {
            return 0;
        }
    },

    createNode: function(html, doc) {
        doc = doc || document;
        let parent = doc.createElement('div');
        parent.innerHTML = html;
        return parent.childNodes[0];
    },

    createNodes: function(html, doc, onlyEle) {
        doc = doc || document;
        let parent = doc.createElement('div');
        parent.innerHTML = html;
        return this.convertNodeListToArray(parent.childNodes, onlyEle);
    },

    convertNodeListToArray: function(nodeList, onlyEle) {
        let ret = [];
        if (nodeList) {
            for (let i = 0; i < nodeList.length; i++) {
                if (!onlyEle || nodeList[i].nodeType === 1) {
                    ret.push(nodeList[i]);
                }
            }
        }
        return ret;
    },

    hasClass: function(ele, className) {
        return _hasClass(ele, className);
    },

    addClass: function(ele, className) {
        if (this.hasClass(ele, className)) {
            return;
        }
        ele.className = ele.className + ' ' + className;
    },

    removeClass: function(ele, className) {
        if (this.hasClass(ele, className)) {
            let class_name = ele.className;
            let class_names = class_name.split(' ');
            for (let i = 0; i < class_names.length; i++) {
                if (!class_names[i] || class_names[i] === className) {
                    class_names.splice(i, 1);
                    i--;
                }
            }
            ele.className = class_names.join(' ');
        }
    },

    getAttrValue: function(ele, attrName) {
        return _getAttrValue(ele, attrName);
    },

    getSizeFromNodeAttrValue: function(val, totalSize, defaultSize) {
        if (objectUtil.isNumber(val)) {
            return val;
        } else if (val && objectUtil.isString(val)) {
            if (val[val.length - 1] === '%') {
                return (val.length === 1 || !objectUtil.isNumber(totalSize)) ? 0 : totalSize * parseFloat(val) / 100;
            } else {
                return parseFloat(val);
            }
        } else {
            return defaultSize ? defaultSize : 0;
        }
    },

    setNodeStyle: function(node, style) {
        if (objectUtil.isString(style)) {
            node.style = style;
        } else if (style) {
            Object.keys(style).forEach(function(key) {
                // 去掉不存在的样式属性
                if (key[0] !== '_') {
                    // 处理和大小相关的样式，必须加上px
                    let need_px = (STYLE_PX_ATTRS.indexOf(key) >= 0);
                    if (!need_px) {
                        for (let i = 0; i < STYLE_PX_PREFIX_ATTRS.length; i++) {
                            if (key.substring(0, STYLE_PX_PREFIX_ATTRS[i].length) === STYLE_PX_PREFIX_ATTRS[i]) {
                                need_px = true;
                                break;
                            }
                        }
                    }
                    let value = style[key];
                    if (need_px && (objectUtil.isNumber(value) || (value && value.substring(value.length - 2) !== 'px'))) {
                        node.style[key] = value + 'px';
                    } else {
                        node.style[key] = value;
                    }
                }
            });
        }
    },

    /** 获取指定节点的当前样式 */
    getNodeStyle: function(node, win) {
        // getComputedStyle只能调用类型为element的节点
        while (node && node.nodeType !== 1) {
            node = node.parentNode;
        }
        if (node) {
            return node.currentStyle || (win || window).getComputedStyle(node);
        } else {
            return null;
        }
    },

    /** 获取指定节点的当前样式属性 */
    getNodeStyleAttr: function(node, styleAttr, win) {
        var style = this.getNodeStyle(node, win);
        return style[styleAttr];
    },

    parseSelector: function(selector) {
        return _parseSelector(selector);
    },

    isMatchSelector: function(ele, selector) {
        return _isMatchSelector(ele, selector);
    },

    traverseDomTree: function(root, handler, selector) {
        if (objectUtil.isString(selector)) {
            selector = _parseSelector(selector);
        }
        _traverseDomTree(root, handler, selector);
    },

    find: function(root, selector) {
        let list = [ ];
        this.traverseDomTree(root, function(node) {
            list.push(node);
        }, selector);
        return list;
    },

    findOne: function(root, selector) {
        let ret;
        this.traverseDomTree(root, function(node) {
            ret = node;
            return -2;
        }, selector);
        return ret;
    },

    findAncestor: function(node, selector, notInclueSelf) {
        if (objectUtil.isString(selector)) {
            selector = _parseSelector(selector);
        }
        if (notInclueSelf && node) {
            node = node.parentNode;
        }
        while (node) {
            if (_isMatchSelector(node, selector)) {
                return node;
            }
            if (node === node.parentNode) {
                break;
            }
            node = node.parentNode;
        }
        return null;
    },

    /** 返回节点的位置和大小 */
    getNodeRect: function(node, includeScroll) {
        let ret = node.getBoundingClientRect();
        // 注意getBoundingClientRect()返回结果的属性都是只读的，所以要处理一下
        let rect = objectUtil.cloneFields(ret, [ 'left', 'right', 'top', 'bottom' ]);
        rect.width = ret.width || (ret.right - ret.left);
        rect.height = ret.height || (ret.bottom - ret.top);
        if (includeScroll) {
            rect.left += document.documentElement.scrollLeft;
            rect.right += document.documentElement.scrollLeft;
            rect.top += document.documentElement.scrollTop;
            rect.bottom += document.documentElement.scrollTop;
        }
        return rect;
    },

    clearNode: function(node) {
        if (!node) {
            return;
        }
        while (node.childNodes && node.childNodes.length > 0) {
            node.removeChild(node.childNodes[0]);
        }
    },

    removeNode: function(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    },

    isIn: function(node, clientX, clientY, appendSize) {
        let rect = this.getNodeRect(node);
        let size = appendSize ? appendSize : 0;
        return (clientX >= (rect.left - size) && clientX < (rect.right + size) &&
            clientY >= (rect.top - size) && clientY < (rect.bottom + size));
    },

    // 创建一个遮罩
    createMaskLayer: function() {
        var mask_node = document.createElement('div');
        this.addClass(mask_node, 'mask-layer');
        document.body.appendChild(mask_node);
        return mask_node;
    },

    /**
     * 将节点适配到容器中
     * @param node 要适配的节点
     * @param holderWidth 容器的宽度
     * @param holderHeight 容器的高度
     * @param width 节点的原始宽度
     * @param height 节点原始高度
     * @param keepRatio 适配是否保持节点原始的宽高比。不保持，则和容器一样大。
     * @returns { width, height } 适配后的节点的宽度和高度
     */
    adaptNodeToHolder: function(node, holderWidth, holderHeight, width, height, keepRatio) {
        let node_width = holderWidth;
        let node_height = holderHeight;
        node.style.left = 0;
        node.style.top = 0;
        if (keepRatio && height && width) {
            let ratio_x = holderWidth / width;
            let ratio_y = holderHeight / height;
            if (ratio_x < ratio_y) {
                node_height = ratio_x * height;
                node.style.top = (holderHeight - node_height) / 2 + 'px';
            } else if (ratio_x > ratio_y) {
                node_width = ratio_y * width;
                node.style.left = (holderWidth - node_width) / 2 + 'px';
            }
        }
        node.style.width = node_width + 'px';
        node.style.height = node_height + 'px';
        return { width: node_width, height: node_height };
    },

    /**
     * 对节点进行缩放。注意：css中的transform的scale缩放，是以节点的中心点为不动点缩放的，这个函数是以节点的左上角点为不动点缩放的。
     * @param node 要缩放的节点
     * @param width 原始大小的宽度
     * @param height 原始大小的高度
     * @param ratioX x方向缩放的比例
     * @param ratioY y方向缩放的比例
     * @param offsetX x方向的偏移
     * @param offsetY y方向的偏移
     */
    zoomNodeByRatio: function(node, width, height, ratioX, ratioY, offsetX, offsetY) {
        node.style.width = width + 'px';
        node.style.height = height + 'px';
        let offset_x = (ratioX - 1.0) * width / 2 + (offsetX || 0);
        let offset_y = (ratioY - 1.0) * height / 2 + (offsetY || 0);
        node.style.transform = 'matrix(' + ratioX + ',0,0,' + ratioY + ',' + offset_x + ',' + offset_y + ')';
    },

    getImageNaturalSize(img, src) {
        if (src) {
            img.src = src;
        }
        let t = this;
        let promise = new Promise(function(resolve) {
            // 现代浏览器
            if (!t.isIE || t.getIEVersion() >= 9.0) {
                if (src) {
                    img.onload = function() {
                        resolve({ width: img.naturalWidth, height: img.naturalHeight });
                    };
                } else {
                    resolve({ width: img.naturalWidth, height: img.naturalHeight });
                }
            } else {
                let new_img = new Image();
                new_img.src = src || img.src;
                new_img.onload = function() {
                    resolve({ width: new_img.width, height: new_img.height });
                };
            }
        });
        return promise;
    },

    preventEventDefault(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else if (event.returnValue) {
            event.returnValue = false;
        }
        return false;
    },
    stopEventPropagation(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },

    getChildOfElement(node) {
        if (node && node.childNodes) {
            for (let i = 0; i < node.childNodes.length; i++) {
                let child = node.childNodes[i];
                if (child.nodeType === 1) {
                    return child;
                }
            }
        }
        return null;
    }
};
