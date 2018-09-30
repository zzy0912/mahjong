/**
 * Created by MyPC on 2017/7/15.
 */

import queryService from './queryService';
import remoteService from './remoteService';

let _cache = { };

function _setEnumItemParentInItems(items, parent) {
    if (items) {
        items.forEach(function(item) {
            item.parent = parent;
            _setEnumItemParentInItems(item.children, item);
        });
    }
}

function _getEnumItem(items, id) {
    if (items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if (item.id === id) {
                return item;
            }
            item = _getEnumItem(item.children, id);
            if (item) {
                return item;
            }
        }
    }
    return null;
}

function _getEnumTreePath(item, onlyId) {
    let path = [ ];
    while (item) {
        path.unshift(onlyId ? item.id : item);
        item = item.parent;
    }
    return path;
}

export default {
    getEnumItemsAsync: function(enumItemModel, isTree) {
        let t = this;
        let promise = new Promise(function(resolve) {
            let items = t.getEnumItems();
            if (items) {
                resolve(items);
                return;
            }
            let method, para;
            if (isTree) {
                method = 'getEntityTree';
                para = { start: 0, pageSize: 1000, countSize: 1000, nodes: queryService.createQueryTreeNodes(enumItemModel) };
            } else {
                method = 'getEntities';
                para = { target: enumItemModel, filter: {}, start: 0, count: 1000 };
            }
            remoteService.call('model', method, para).then(function(result) {
                t.setEnumItems(enumItemModel, isTree, result.list);
                resolve(result.list);
            }, function() {
            });
        });
        return promise;
    },

    getEnumItems: function(enumItemModel) {
        let enum_data = _cache[enumItemModel];
        return enum_data ? enum_data.items : null;
    },

    setEnumItems: function(enumItemModel, isTree, items) {
        let enum_data = _cache[enumItemModel];
        if (!enum_data) {
            enum_data = { };
            _cache[enumItemModel] = enum_data;
        }
        enum_data.items = items || [ ];
        if (isTree) {
            _setEnumItemParentInItems(items, null);
        }
    },

    getEnumItem: function(enumItemModel, id) {
        let items = this.getEnumItems(enumItemModel);
        return _getEnumItem(items, id);
    },

    getEnumTreePath: function(enumItemModel, id, onlyId) {
        let item = this.getEnumItem(enumItemModel, id);
        return _getEnumTreePath(item, onlyId);
    },

    getEnumTreePathByItems: function(items, id, onlyId) {
        _setEnumItemParentInItems(items, null);
        let item = _getEnumItem(items, id);
        return _getEnumTreePath(item, onlyId);
    }
};
