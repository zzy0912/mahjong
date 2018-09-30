/**
 * Created by MyPC on 2017/7/17.
 */

import objectUtil from '../util/objectUtil';

function _handleQueryVarsInFilter(filter, vars) {
    if (!filter) {
        return;
    }
    if (objectUtil.isArray(filter)) {
        for (let i = 0; i < filter.length; i++) {
            _handleQueryVarsInFilter(filter[i], vars);
        }
    } else if (filter.relation) {
        _handleQueryVarsInFilter(filter.children, vars);
    } else if (objectUtil.isString(filter.value) && filter.value[0] === '$') {
        let value = objectUtil.getFieldValue(vars, filter.value);
        if (value === '$undefined') {
            for (let key in filter) {
                delete filter[key];
            }
        } else if (value !== undefined) {
            filter.value = value;
        }
        // return filter;
    }
}

export default {
    createQueryTreeNodes: function(model) {
        let nodes = [ ];
        let node = { subnodes: [ { type: model, filter: { field: 'parent', match: 'EQ', value: null } } ] };
        nodes.push(node);
        node = { type: model, subnodes: [ { type: model, filter: { field: 'parent.id', match: 'EQ', value: '$parentId' } } ] };
        nodes.push(node);
        return nodes;
    },

    handleQueryVarsInFilter: function(filter, vars) {
        if (!filter || !vars || !this.hasQueryVarsInFilter(filter)) {
            return filter;
        }
        let clone_filter = objectUtil.clone(filter);
        _handleQueryVarsInFilter(clone_filter, vars);
        // clone_filter = _handleQueryVarsInFilter(clone_filter, vars);
        return clone_filter;
    },

    getQueryVarValue: function(vars, varName) {
        if (!varName || varName[0] !== '$') {
            return varName;
        }
        return objectUtil.getFieldValue(vars, varName);
    },

    hasQueryVarsInFilter: function(filter) {
        if (filter) {
            if (objectUtil.isArray(filter)) {
                for (let i = 0; i < filter.length; i++) {
                    if (this.hasQueryVarsInFilter(filter[i])) {
                        return true;
                    }
                }
                return false;
            } else if (filter.relation) {
                return this.hasQueryVarsInFilter(filter.children);
            } else {
                return (objectUtil.isString(filter.value) && filter.value[0] === '$');
            }
        }
        return false;
    }
};
