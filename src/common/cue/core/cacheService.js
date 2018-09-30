/**
 * Created by MyPC on 2017/6/16.
 */

import objectUtil from '../util/objectUtil';

// 缓存数据
var _cache = { };
// 数据的状态，如果是true，表示已缓存，如果是Array，表示正在查询中
var _status = { };

function _set(cache, status, parts, pos, value) {
    var part = parts[pos];
    if (pos === parts.length - 1) {
        cache[part] = value;
        status[part] = true;
    } else {
        if (!cache[part]) {
            cache[part] = { };
            status[part] = { };
        }
        _set(cache[part], status[part], parts, pos + 1, value);
    }
}

function _get(cache, status, parts, pos) {
    if (!status) {
        return undefined;
    }
    var part = parts[pos];
    if (pos === parts.length - 1) {
        if (status[part] === true) {
            return cache[part];
        } else {
            return undefined;
        }
    } else if (cache) {
        return _get(cache[part], status[part], parts, pos + 1);
    } else {
        return undefined;
    }
}

function _clear(cache, status, parts, pos) {
    if (!status) {
        return;
    }
    var part = parts[pos];
    if (pos === parts.length - 1) {
        delete cache[part];
        delete status[part];
    } else {
        _clear(cache[part], status[part], parts, pos + 1);
    }
}

function _has(status, parts, pos) {
    if (!status) {
        return false;
    }
    var part = parts[pos];
    if (pos === parts.length - 1) {
        return (status[part] === true);
    } else {
        return _has(status[part], parts, pos + 1);
    }
}

function _getStatusParent(status, parts, pos) {
    if (pos === parts.length - 1) {
        return status;
    }
    var part = parts[pos];
    if (!status[part]) {
        status[part] = {};
    }
    return _getStatusParent(status[part], parts, pos + 1);
}

export default {
    // key必须到最底层
    set: function(key, value) {
        var parts = key.split('.');
        _set(_cache, _status, parts, 0, value);
    },

    // key必须到最底层
    get: function(key) {
        var parts = key.split('.');
        return _get(_cache, _status, parts, 0);
    },

    // key不需要到最底层，可以清除部分
    clear: function(key) {
        var parts = key.split('.');
        _clear(_cache, _status, parts, 0);
    },

    // key必须到最底层
    has: function(key) {
        var parts = key.split('.');
        return _has(_status, parts, 0);
    },

    getAsync: function(key, getter) {
        let t = this;
        let promise = new Promise(function(resolve, reject) {
            let parts = key.split('.');
            // 获取状态并构建
            let status_parent = _getStatusParent(_status, parts, 0);
            let last_part = parts[parts.length - 1];
            let status = status_parent[last_part];
            if (status === true) {
                // 缓存中有数据
                resolve(t.get(key));
            } else if (objectUtil.isArray(status)) {
                // 缓存中没有数据，但正在查询数据，还没有返回
                status.push({ resolve, reject });
            } else {
                // 缓存中没有数据，且没有查询
                status = [ { resolve, reject } ];
                status_parent[last_part] = status;
                getter().then(function(result) {
                    _set(_cache, _status, parts, 0, result);
                    status.forEach(function(item) {
                        item.resolve(result);
                    });
                }, function(result) {
                    _set(_cache, _status, parts, 0, undefined);
                    status.forEach(function(item) {
                        item.reject(result);
                    });
                });
            }
        });
        return promise;
    }
};
