/**
 * Created by MyPC on 2017/6/14.
 */

import domUtil from '../util/domUtil';
import stringUtil from '../util/stringUtil';
import objectUtil from '../util/objectUtil';
import remoteService from './remoteService';
import enumService from './enumService';
import uiService from './uiService';
import queryService from './queryService';
import envService from './envService';

function _addFieldEnumToDataDesp(fieldDesp, dataDesp) {
    if (fieldDesp.targets) {
        fieldDesp.targets.forEach(function(targetDesp) {
            _addFieldEnumToDataDesp(targetDesp, dataDesp);
        });
    } else if (fieldDesp.enumItemModel && (fieldDesp.enumEditable || fieldDesp.enumIsTree) &&
        dataDesp.enums.findIndex((n) => n.itemModel === fieldDesp.enumItemModel) < 0) {
        dataDesp.enums.push({
            itemModel: fieldDesp.enumItemModel,
            isTree: fieldDesp.enumIsTree
        });
    }
}

function _addFieldToDataTargetDesp(fieldDesp, targetDesp) {
    targetDesp.fields.push(fieldDesp);
    let field = fieldDesp.field;
    if (field.indexOf('&') >= 0) {
        fieldDesp.fields = field.split('&');
        fieldDesp.formField = fieldDesp.fields.join('_');
        targetDesp.retFields.push(...fieldDesp.fields);
    } else {
        targetDesp.retFields.push(field);
    }
}

function _initDataTargetDesp(targetDesp) {
    targetDesp.fields = [];
    if (objectUtil.isString(targetDesp.retFields)) {
        targetDesp.retFields = targetDesp.retFields.split(';');
    } else {
        targetDesp.retFields = targetDesp.retFields || [];
    }
}

function _handleFetchItemEnumField(item, field, enumTreeItemsOrModel) {
    let value_id = objectUtil.getObjectId(item[field]);
    if (objectUtil.isString(enumTreeItemsOrModel)) {
        // 必须是全路径的值，所以这里要找到全路径
        item[field] = enumService.getEnumTreePath(enumTreeItemsOrModel, value_id, true);
    } else if (enumTreeItemsOrModel) {
        item[field] = enumService.getEnumTreePathByItems(enumTreeItemsOrModel, value_id, true);
    } else if (value_id > 0) {
        item[field] = value_id;
    }
}

function _handleSubmitItemEnumField(item, field, enumIsTree) {
    if (item[field]) {
        if (enumIsTree) {
            let arr = item[field];
            if (objectUtil.isArray(arr) && arr.length > 0) {
                item[field] = { id: arr[arr.length - 1] };
            } else {
                item[field] = null;
            }
        } else {
            item[field] = { id: item[field] };
        }
    } else {
        item[field] = null;
    }
}

export default {
    setDataDespInCompo: function(compo, para) {
        let data_desp = this.getDataDespInCompo(compo);
        compo.dataDesp = Object.assign(data_desp, para);
    },

    getDataDespInCompo: function(compo) {
        let data_desp = compo.dataDesp;
        if (!data_desp) {
            domUtil.traverseDomTree(compo.$el, function(ele) {
                if (data_desp) {
                    let q_field = domUtil.getAttrValue(ele, 'data-field');
                    if (q_field) {
                        let field_desp = stringUtil.parseJsonLikeObject(q_field);
                        if (field_desp) {
                            // set enums need to query
                            _addFieldEnumToDataDesp(field_desp, data_desp);
                            if (data_desp.targets) {
                                data_desp.targets.forEach(function(targetDesp, index) {
                                    if (field_desp.targets) {
                                        _addFieldToDataTargetDesp(field_desp.targets[index], targetDesp);
                                    } else {
                                        _addFieldToDataTargetDesp(field_desp, targetDesp);
                                    }
                                });
                            } else {
                                _addFieldToDataTargetDesp(field_desp, data_desp);
                            }
                        }
                        return -1;
                    }
                } else {
                    let q_item = domUtil.getAttrValue(ele, 'data-desp');
                    if (q_item) {
                        data_desp = stringUtil.parseJsonLikeObject(q_item);
                        data_desp.enums = [];
                        if (data_desp.targets) {
                            data_desp.targets.forEach(function(targetDesp) {
                                _initDataTargetDesp(targetDesp);
                            });
                        } else {
                            _initDataTargetDesp(data_desp);
                        }
                    }
                }
            });
            compo.dataDesp = data_desp;
        }
        return data_desp;
    },

    getItemDefaultValueInCompo: function(compo) {
        // 遍历所有字段描述，检查字段是否设置了defaultValue
        let data_desp = this.getDataDespInCompo(compo);
        if (!data_desp) {
            console.error('no data desp in get item deafult value');
            return;
        }
        let item = {};
        data_desp.fields.forEach(function(fieldDesp) {
            if (fieldDesp.defaultValue !== undefined) {
                item[fieldDesp.field] = envService.getVarValue(fieldDesp.defaultValue);
            }
        });
        return item;
    },

    fetchItemInCompo: function(compo, itemId, handlers) {
        let calls = this.getCallOfFetchItemInCompo(compo, itemId);
        let stop;
        if (handlers && handlers.onBeforeSendCall) {
            stop = handlers.onBeforeSendCall(calls);
        }
        if (!stop) {
            let t = this;
            let set_item;
            let promise = new Promise(function(resolve, reject) {
                calls = calls || stop;
                if (calls.length > 0) {
                    remoteService.batchCall(calls).then(function(results) {
                        if (handlers && handlers.onBeforeHandleResult) {
                            stop = handlers.onBeforeHandleResult(results);
                        }
                        if (!stop) {
                            set_item = t.handleResultOfFetchItemInCompo(compo, results, itemId);
                            if (handlers && handlers.onAfterHandleResult) {
                                handlers.onAfterHandleResult(results);
                            }
                        }
                        resolve(set_item);
                    }, function() {
                        reject();
                    });
                } else {
                    set_item = t.handleResultOfFetchItemInCompo(compo, [ null ], itemId);
                    resolve(set_item);
                }
            });
            return promise;
        }
    },

    getCallOfFetchItemInCompo: function(compo, itemId) {
        let data_desp = this.getDataDespInCompo(compo);
        if (!data_desp) {
            console.error('no data desp in fetch item');
            return;
        }
        compo.$set(compo[data_desp.name], 'id', itemId);
        let calls = [ ];
        if (data_desp.target) {
            calls.push(remoteService.createCall('model', 'getEntity', 'target', data_desp.target, 'id', itemId, 'retFields', data_desp.retFields));
        }
        if (data_desp.enums) {
            data_desp.enums.forEach(function(enumDesp) {
                // read enum data from cache
                let enum_items = enumService.getEnumItems(enumDesp.itemModel);
                // if cache has data
                if (enum_items) {
                    // set data to enumDesp
                    enumDesp.items = enum_items;
                    // set select options
                    compo.$set(compo.selectOptions, enumDesp.itemModel, enumDesp.items);
                } else {
                    // get data from server
                    calls.push(remoteService.createCall('model', 'getEntities', 'target', enumDesp.itemModel, 'retFields', ['id', 'label', 'defaultFlag'], 'start', 0, 'count', 1000));
                }
            });
        }
        return calls;
    },

    handleResultOfFetchItemInCompo: function(compo, results, itemId) {
        // process enums
        let data_desp = this.getDataDespInCompo(compo);
        if (!data_desp) {
            return;
        }
        if (data_desp.enums) {
            let enum_call_idx = 1;
            data_desp.enums.forEach(function(enumDesp) {
                if (!enumDesp.items) {
                    enumDesp.items = results[enum_call_idx].list;
                    enum_call_idx++;
                    // save data to cache
                    enumService.setEnumItems(enumDesp.itemModel, enumDesp.isTree, enumDesp.items);
                    // set select options
                    compo.$set(compo.selectOptions, enumDesp.itemModel, enumDesp.items);
                }
            });
        }
        // save server item
        compo.serverItem = results[0] || {};
        // process item
        let item = objectUtil.clone(compo.serverItem);
        data_desp.fields.forEach(function(fieldDesp) {
            if (fieldDesp.fields) {
                item[fieldDesp.formField] = [item[fieldDesp.fields[0]], item[fieldDesp.fields[1]]];
                delete item[fieldDesp.fields[0]];
                delete item[fieldDesp.fields[1]];
            } else if (fieldDesp.enumItemModel) {
                _handleFetchItemEnumField(item, fieldDesp.field, fieldDesp.enumIsTree ? fieldDesp.enumItemModel : null);
            }
        });
        let set_item = {};
        if (compo.getItemInitialValue) {
            set_item = Object.assign(set_item, compo.getItemInitialValue());
        } else {
            set_item = Object.assign(set_item, compo[data_desp.name]);
        }
        // defaultValue只用于创建时。未来如果不管是否创建都要使用，可以考虑支持defaultValueAllTime
        if (compo.getItemDefaultValue && objectUtil.isNumber(itemId) && itemId <= 0) {
            set_item = Object.assign(set_item, compo.getItemDefaultValue());
        }
        this.mixinItem(item, set_item);
        // 为了在ui上生效，需要设置一下对象
        compo[data_desp.name] = set_item;
        return set_item;
    },

    handleFetchItemEnumField: function(item, field, enumTreeItemsOrModel) {
        let t = this;
        if (objectUtil.isArray(item)) {
            item.forEach(n => {
                t.handleFetchItemEnumField(n, field);
            });
        } else if (objectUtil.isArray(field)) {
            field.forEach(n => {
                t.handleFetchItemEnumField(item, n);
            });
        } else if (item) {
            _handleFetchItemEnumField(item, field, enumTreeItemsOrModel);
        }
    },

    submitItemInCompo: function(compo, itemId, handlers) {
        let call = this.getCallOfSubmitItemInCompo(compo, itemId);
        let stop;
        if (handlers && handlers.onBeforeSendCall) {
            stop = handlers.onBeforeSendCall(call);
        }
        if (!stop) {
            let t = this;
            let promise = new Promise(function(resolve, reject) {
                call = call || stop;
                if (call) {
                    remoteService.call(call.service, call.method, call.para).then(function(result) {
                        if (handlers && handlers.onBeforeHandleResult) {
                            stop = handlers.onBeforeHandleResult(result);
                        }
                        if (!stop) {
                            let data_desp = t.getDataDespInCompo(compo);
                            // update success and modify server item
                            if (data_desp) {
                                compo.serverItem = objectUtil.clone(compo[data_desp.name]);
                            }
                            if (handlers && handlers.onAfterHandleResult) {
                                handlers.onAfterHandleResult(result);
                            }
                        }
                        resolve(result);
                    }, function() {
                        uiService.showAlert('数据提交失败', 'error');
                        reject();
                    });
                } else {
                    reject();
                }
            });
            return promise;
        }
    },

    getCallOfSubmitItemInCompo: function(compo, itemId) {
        let data_desp = this.getDataDespInCompo(compo);
        if (data_desp) {
            let submit_item = this.getSubmitItemInCompo(compo, itemId);
            if (submit_item) {
                let call_para = { target: data_desp.target, entity: submit_item };
                return { service: 'model', method: 'updateEntity', para: call_para };
            }
        }
    },

    getSubmitItemInCompo: function(compo, itemId) {
        let data_desp = this.getDataDespInCompo(compo);
        if (!data_desp) {
            console.error('no data desp in submit item');
            return;
        }
        // process item
        let item = objectUtil.clone(compo[data_desp.name]);
        data_desp.fields.forEach(function(fieldDesp) {
            // remove not allow to submit fields
            if (fieldDesp.submit === false) {
                if (fieldDesp.fields) {
                    delete item[fieldDesp.fields[0]];
                    delete item[fieldDesp.fields[1]];
                } else {
                    delete item[fieldDesp.field];
                }
            } else if (fieldDesp.fields) {
                item[fieldDesp.fields[0]] = item[fieldDesp.formField][0];
                item[fieldDesp.fields[1]] = item[fieldDesp.formField][1];
                delete item[fieldDesp.formField];
            } else if (fieldDesp.enumItemModel) {
                _handleSubmitItemEnumField(item, fieldDesp.field, fieldDesp.enumIsTree);
            }
        });
        // get change
        return this.getSubmitItemChange(item, compo.serverItem, itemId);
    },

    handleSubmitItemEnumField: function(item, field, enumIsTree) {
        let t = this;
        if (objectUtil.isArray(item)) {
            item.forEach(n => {
                t.handleSubmitItemEnumField(n, field);
            });
        } else if (objectUtil.isArray(field)) {
            field.forEach(n => {
                t.handleSubmitItemEnumField(item, n);
            });
        } else if (item) {
            _handleSubmitItemEnumField(item, field, enumIsTree);
        }
    },

    getSubmitItemChange(item, serverItem, itemId) {
        let submit_item;
        if (itemId > 0) {
            submit_item = this.getChange(serverItem, item);
        } else {
            submit_item = this.miniItem(item);
        }
        if (submit_item) {
            submit_item.id = itemId;
        }
        return submit_item;
    },

    // 查询列表

    getQueryParaInCompo: function(compo) {
        let query_para = {};
        // 设置页面
        query_para.pageNo = compo.pageNo;
        // 设置排序
        if (compo.sort) {
            query_para.sort = compo.sort;
        }
        // 设置附加过滤器
        if (compo.extraFilter) {
            query_para.extraFilter = compo.extraFilter;
        }
        return query_para;
    },

    fetchItemsInCompo: function(compo, queryPara, queryVars, handlers) {
        let call = this.getCallOfFetchItemsInCompo(compo, queryPara, queryVars);
        let stop;
        if (handlers && handlers.onBeforeSendCall) {
            stop = handlers.onBeforeSendCall(call);
        }
        if (!stop) {
            let t = this;
            let promise = new Promise(function(resolve, reject) {
                call = call || stop;
                remoteService.call(call.service, call.method, call.para).then(function(result) {
                    if (handlers && handlers.onBeforeHandleResult) {
                        stop = handlers.onBeforeHandleResult(result);
                    }
                    if (!stop) {
                        t.handleResultOfFetchItemsInCompo(compo, result);
                        if (handlers && handlers.onAfterHandleResult) {
                            stop = handlers.onAfterHandleResult(result);
                        }
                        if (!stop) {
                            let data_desp = t.getDataDespInCompo(compo);
                            compo[data_desp.name] = result.list;
                            compo.itemsTotalCount = result.totalCount;
                        }
                    }
                    resolve(result);
                }, function() {
                    reject();
                });
            });
            return promise;
        }
    },

    getCallOfFetchItemsInCompo: function(compo, queryPara, queryVars) {
        // target/name/query/queryVars/retFields
        let data_desp = this.getDataDespInCompo(compo);
        let query_para = queryPara ? queryPara : { };
        // page
        let count = query_para.count || query_para.pageSize || data_desp.count || data_desp.pageSize || 20;
        let start;
        if (objectUtil.isNumber(query_para.start)) {
            start = query_para.start;
        } else if (objectUtil.isNumber(query_para.pageNo)) {
            start = query_para.pageNo * count;
        } else if (objectUtil.isNumber(data_desp.start)) {
            start = data_desp.start;
        } else if (objectUtil.isNumber(data_desp.pageNo)) {
            start = data_desp.pageNo * count;
        } else {
            start = 0;
        }
        // call para
        let call_para = {
            query: data_desp.query,
            start: start,
            count: count
        };
        if (query_para.extraFilter) {
            call_para.extraFilter = query_para.extraFilter;
        }
        if (data_desp.targets) {
            call_para.targets = [ ];
            for (let i = 0; i < data_desp.targets.length; i++) {
                call_para.targets.push({});
                this._constructGetEntitiesTargetPara(call_para.targets[i], data_desp.targets[i], query_para, queryVars);
            }
        } else {
            this._constructGetEntitiesTargetPara(call_para, data_desp, query_para, queryVars);
        }
        return { service: 'model', method: 'getEntities', para: call_para };
    },

    _constructGetEntitiesTargetPara: function(targetPara, targetDesp, queryPara, queryVars) {
        targetPara.target = targetDesp.target;
        targetPara.filter = queryService.handleQueryVarsInFilter(targetDesp.filter, queryVars);
        targetPara.retFields = targetDesp.retFields;
        // sort
        let sort = targetDesp.sort || queryPara.sort;
        if (sort) {
            targetPara.orderBy = sort.split(';');
        }
    },

    handleResultOfFetchItemsInCompo: function(compo, result) {
        compo;
        result;
    },

    deleteItemInCompo: function(compo, item) {
        let data_desp = this.getDataDespInCompo(compo);
        let calls = [ ];
        let delete_target;
        if (data_desp.targets && data_desp.targets.length > 1) {
            delete_target = item.$type;
        } else {
            delete_target = data_desp.target;
        }
        if (objectUtil.isArray(item)) {
            item.forEach(function(it) {
                calls.push({ service: 'model', method: 'deleteEntity', para: { target: delete_target, id: objectUtil.getObjectId(it) } });
            });
        } else {
            calls.push({ service: 'model', method: 'deleteEntity', para: { target: delete_target, id: objectUtil.getObjectId(item) } });
        }
        let promise = new Promise(function(resolve) {
            remoteService.batchCall(calls).then(function() {
                resolve();
            });
        });
        return promise;
    },

    /**
     * 修改组件的附加过滤器
     * @param compo 组件
     * @param field 条件字段名。支持多个字段，格式类似field1 match1;field2 match2。注意：这里的多字段之间的关系为OR。
     * @param value 条件的值。如果值为空，表示从该过滤器中去掉该条件。field为多字段时，每个字段都是使用这个value。
     */
    modifyExtraFilter: function(compo, field, value) {
        if (!field) {
            return;
        }
        let parts = field.split(';');
        let fields = [];
        let matches = [];
        parts.forEach(function(part) {
            let part_parts = part.split(' ');
            fields.push(part_parts[0]);
            matches.push(part_parts[1]);
        });
        // 从过滤器中去掉条件
        let filter = this._deleteFilterConditions(compo.extraFilter, fields);
        // 判断是否要添加条件
        if (value !== undefined && value !== null && value !== '') {
            let cond = this._buildFilterConditions(fields, value, matches);
            if (filter) {
                if (filter.relation === 'AND') {
                    filter.children.push(cond);
                } else {
                    filter = { relation: 'AND', children: [ filter, cond ] };
                }
            } else {
                filter = cond;
            }
        }
        // minimize过滤器
        if (filter) {
            if (filter.field || filter.relation === 'OR' || filter.children.length > 1) {
                filter = Object.assign({}, filter);
            } else if (filter.children.length === 0) {
                filter = null;
            } else {
                filter = Object.assign({}, filter.children[0]);
            }
        }
        compo.extraFilter = filter;
    },

    _deleteFilterConditions: function(filter, fields) {
        if (filter) {
            if (filter.relation === 'AND') {
                for (let i = 0; i < filter.children.length; i++) {
                    if (this._isMatchFilterConditions(filter.children[i], fields)) {
                        filter.children.splice(i, 1);
                        break;
                    }
                }
            } else if (this._isMatchFilterConditions(filter, fields)) {
                return null;
            }
        }
        return filter;
    },

    _isMatchFilterConditions: function(cond, fields) {
        if (cond.relation === 'OR' && cond.children.length === fields.length) {
            for (let i = 0; i < cond.children.length; i++) {
                if (fields.indexOf(cond.children[i].field) < 0) {
                    return false;
                }
            }
            return true;
        } else if (fields.length === 1 && cond.field === fields[0]) {
            return true;
        }
        return false;
    },

    _buildFilterConditions: function(fields, value, matches) {
        if (fields.length === 1) {
            return { field: fields[0], match: matches[0], value: value };
        } else {
            let conds = [ ];
            for (let i = 0; i < fields.length; i++) {
                conds.push({ field: fields[i], match: matches[i], value: value });
            }
            return { relation: 'OR', children: conds };
        }
    },

    // 对于对象，会递归mixin下去，并且在mixin时会检查值是否相等
    mixinItem: function(src, dst, override) {
        let t = this;
        Object.keys(src).forEach(function(key) {
            if (dst[key] === undefined) {
                // dst该属性无值，赋值
                dst[key] = src[key];
            } else if (objectUtil.isObject(src[key]) && objectUtil.isObject(dst[key] && t.isSameValue(src[key], dst[key]))) {
                // dst和src的属性值是相同对象，递归mixin
                t.mixinItem(src[key], dst[key], override);
            } else if (override) {
                // 如果设置了强制覆盖，赋值
                dst[key] = src[key];
            }
        });
    },

    getChange: function(oldItem, newItem) {
        // 如果newItem为空，那么没有差异
        if (!newItem) {
            return null;
        }
        // 如果oldItem为空，返回newItem
        if (!oldItem) {
            return this.miniItem(newItem);
        }
        // 扫描newItem所有字段
        let change = { };
        // enumerable own keys
        let t = this;
        let changed = false;
        Object.keys(newItem).forEach(function(key) {
            let field_change = t.getFieldChange(oldItem[key], newItem[key]);
            if (field_change !== undefined) {
                change[key] = field_change;
                changed = true;
            }
        });
        // 返回null表示没有发生变化
        return changed ? change : null;
    },

    // 返回undefined表示没有差异，其他值表示新值
    getFieldChange: function(oldValue, newValue, valueType) {
        return this.isSameValue(oldValue, newValue, valueType) ? undefined : this.miniValue(newValue);
    },

    // 判断两个字段的值是否相等
    isSameValue: function(oldValue, newValue) {
        if (newValue === undefined) {
            // 如果newValue为undefined，表示没有变化
            return true;
        } else if (oldValue === undefined) {
            // 如果oldValue为undefined，按照空值判断
            return objectUtil.isEmptyValue(newValue);
        } else if (objectUtil.isEmptyValue(newValue)) {
            // 如果newValue为空值，判断oldValue是否为空值。
            return objectUtil.isEmptyValue(oldValue);
//        } else if (newValue instanceof this.DataChange)
//            return false;
        } else if (objectUtil.isEmptyValue(oldValue)) {
            // 如果newValue非空，但是oldValue为空
            return false;
        } else if (objectUtil.isArray(newValue)) {
            // 如果newValue是数组
            // 检查newValue的元素数是否和oldValue一致
            if (oldValue.length === newValue.length) {
                let all_found = true;
                // 扫描newValue的所有元素，检查是否能在oldValue中找到。
                for (let i = 0; i < newValue.length; i++) {
                    // 能否在oldValue中找到一致的item
                    let idx = this.findItemInList(oldValue, newValue[i]);
                    if (idx < 0) {
                        all_found = false;
                        break;
                    }
                }
                return all_found;
            } else {
                return false;
            }
        } else if (objectUtil.isDate(newValue)) {
            // 这里只能处理dateTime类型，如果是date和time类型，在传入的时候要处理一下，date的时间部分清空，time的日期部分改成19700101。
            if (objectUtil.isDate(oldValue)) {
                return (oldValue.getTime() === newValue.getTime());
            } else {
                return false;
            }
        } else if (objectUtil.isObject(newValue) || objectUtil.isObject(oldValue)) {
            // oldValue或者newValue，任何一个是object对象，比较id
            // 如果id不相同，肯定不同
            let old_id = objectUtil.getObjectId(oldValue);
            let new_id = objectUtil.getObjectId(newValue);
            if (old_id !== new_id) {
                return false;
            }
            // 如果有类型，且类型不同，肯定不同
            var new_type = objectUtil.isObject(newValue) ? newValue.$type : null;
            var old_type = objectUtil.isObject(oldValue) ? oldValue.$type : null;
            return (!new_type || !old_type || new_type !== old_type);
        } else if (objectUtil.isNumber(newValue)) {
            if (stringUtil.isNumber(oldValue)) {
                return (newValue === parseInt(oldValue, 10));
            } else {
                return (newValue === oldValue);
            }
        } else if (objectUtil.isNumber(oldValue) && stringUtil.isNumber(newValue)) {
            return (oldValue === parseInt(newValue, 10));
        }
        return (oldValue === newValue);
    },

    // 在数组中找相同的item
    findItemInList: function(list, item) {
        if (objectUtil.isArray(list)) {
            let is_item_obj = objectUtil.isObject(item);
            for (let i = 0; i < list.length; i++) {
                if (this.isSameValue(list[i], item)) {
                    // 如果是对象，要没有更改任何属性
                    if (objectUtil.isObject(list[i]) || is_item_obj) {
                        let change = this.getChange(list[i], item);
                        if (change) {
                            return -1;
                        }
                    }
                    return i;
                }
            }
        }
        return -1;
    },

    // 最小化实体
    miniItem: function(item) {
        if (objectUtil.isObject(item)) {
            let mini_item = { };
            // enumerable own keys
            let t = this;
            Object.keys(item).forEach(function(key) {
                mini_item[key] = t.miniValue(item[key]);
            });
            return mini_item;
        } else {
            return this.miniValue(item);
        }
    },

    // 最小化字段的值
    miniValue: function(value) {
        let mini_value;
        let t = this;
        if (value === undefined) {
            return undefined;
        } else if (objectUtil.isEmptyValue(value)) {
            return null;
//        } else if (value instanceof this.DataChange)
//            return value;
        } else if (objectUtil.isArray(value)) {
            // 数组说明是扩展表，每个元素都是item，不是字段
            mini_value = [ ];
            value.forEach(itValue => {
                mini_value.push(t.miniItem(itValue));
            });
            return mini_value;
        } else if (objectUtil.isObject(value)) {
            mini_value = { id: objectUtil.getObjectId(value) };
            if (value.$type) {
                mini_value.$type = value.$type;
            }
            return mini_value;
        }
        return value;
    },

    miniValueList(values) {
        // 数组说明是扩展表，每个元素都是item，不是字段
        let mini_values = [ ];
        if (values) {
            let t = this;
            values.forEach(value => {
                mini_values.push(t.miniValue(value));
            });
        }
        return mini_values;
    }
};
