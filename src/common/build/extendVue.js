/**
 * Created by MyPC on 2017/6/8.
 */
let path = require('path');
let fs = require('fs');
let htmlparser2 = require('htmlparser2');
let dom_serialize = require('dom-serializer');
let cue = require('./cueUtil');

let fsUtil = require('./fsUtil');
let defService = require('./defService');
let domUtil = require('./domUtil');

const SORT_TYPES = [ 'boolean', 'int', 'long', 'float', 'double', 'string', 'date', 'dateTime', 'time' ];
const SIMPLE_TYPES = [ 'boolean', 'int', 'long', 'float', 'double', 'string', 'text', 'richText', 'date', 'dateTime', 'time' ];
const SIMPLE_TYPE_CATEGROIES = {
    boolean: 'boolean', int: 'number', long: 'number', float: 'number', double: 'number',
    string: 'string', text: 'string', richText: 'string', date: 'date', time: 'date', dateTime: 'date'
}
const DOM_PARSE_OPTS = { lowerCaseTags: false, lowerCaseAttributeNames: false, recognizeSelfClosing: true };

function getEnumItemOptionsName(itemModel) {
    return 'selectOptions.' + itemModel;
}
// 处理字段简写：item@field:type#label^component(attrs)
function parseFieldAbbreviation(def) {
    let field_desp = { };
    if (def) {
        // 解析属性
        let pos = def.indexOf('(');
        if (pos >= 0) {
            let prop = def.substring(pos + 1, def.length - 1);
            def = def.substring(0, pos);

            let props = prop.split(',');
            for (let i = 0; i < props.length; i++) {
                prop = props[i];
                pos = prop.indexOf('=');
                if (pos >= 0) {
                    let prop_attr = prop.substring(0, pos);
                    let prop_value = prop.substring(pos + 1);
                    field_desp[prop_attr] = cue.stringUtil.parseJsonValue(prop_value);
                } else if (cue.stringUtil.isNumberInStyle(prop)) {
                    field_desp.width = cue.stringUtil.isInt(prop) ? parseInt(prop, 10) : prop;
                } else {
                    console.log('qbuild: failed to parse field attr - ' + prop);
                }
            }
        }
        // 解析组件
        pos = def.indexOf('^');
        if (pos >= 0) {
            field_desp.component = def.substring(pos + 1);
            def = def.substring(0, pos);
        }
        // 解析标签
        pos = def.indexOf('#');
        if (pos >= 0) {
            field_desp.label = def.substring(pos + 1);
            def = def.substring(0, pos);
        }
        // 解析类型
        pos = def.indexOf(':');
        if (pos >= 0) {
            field_desp.type = def.substring(pos + 1);
            def = def.substring(0, pos);
        }
        // 解析数据
        pos = def.indexOf('@');
        if (pos >= 0) {
            field_desp.field = def.substring(pos + 1);
            field_desp.item = def.substring(0, pos);
        } else {
            field_desp.field = def;
        }
    }
    return field_desp;
}

// 属性输出的位置：未定义，根据属性名字来判断。''输出到data-field中，'#'输出到ele中，'#&'输出到ele的style中，'>'输出到input-ele中，'>&'输出到input-ele的style中。
const ATTR_OUTPUTS = {
    formItem: { field: [ '', '#prop' ], label: '#', width: '>&', disabled: '>:disabled', selector: '>' },
    column: { field: [ '', '#prop' ], label: '#', width: '#' }
};

/** 将字段简写内容合并到data-field中，同时处理缺省值
 *
 * @param ele
 * @param fieldDesp
 * @param env
 * @param attrOutput 属性输出的位置。
 */
function processQField(ele, fieldDesp, env, attrOutput) {
    let field_desp = fieldDesp || {};
    let q_field = htmlparser2.DomUtils.getAttributeValue(ele, 'data-field');
    if (q_field) {
        // 解析data-field的内容，并合并到field_desp中。注意data-field中内容的优先级高。
        Object.assign(field_desp, cue.stringUtil.parseJsonLikeObject(q_field));
    }

    // 处理多targets，只在列定义中使用
    let attr_output = ATTR_OUTPUTS[attrOutput];
    let data_field;
    if (field_desp.targets) {
        // 每个target都要处理字段定义
        data_field = { targets: [] };
        field_desp.targets.forEach((it, idx) => {
            processQFieldDef(ele, it, env, env.targets[idx].target);
            data_field.targets.push(processQFieldAttrOutput(it, (idx === 0) ? ele : null, attr_output));
        });
    }
    else {
        processQFieldDef(ele, field_desp, env, env.target);
        data_field = processQFieldAttrOutput(field_desp, ele, attr_output);
    }
    ele.attribs['data-field'] = cue.stringUtil.serializeEleAttr(data_field);
}

function processQFieldDef(ele, fieldDesp, env, target) {
    // 如果没有定义字段，直接返回
    let field = fieldDesp.field;
    if (!field)
        return;
    var model_def;
    if (target)
        model_def = defService.getModelDef(target);
    if (model_def) {
        // 读入字段定义。注意：如果是多字段的话，读入第一个字段的定义。
        let fields = field.split('&');
        let field_def = defService.getFieldDef(model_def, fields[0]);
        if (field_def) {
            fieldDesp.type = fieldDesp.type || field_def.type;
            fieldDesp.label = fieldDesp.label || field_def.label;
        }
    }

    let field_type = fieldDesp.type;
    if (field_type) {
        // 处理枚举定义：enum:enumModel:enumName:optionsName[field,field]
        if (field_type.substring(0, 5) === 'enum:') {
            fieldDesp.category = 'enum';
            // 这几个属性后面代码要用，但不用输出。$$开头表示内部属性，不用输出
            fieldDesp.$$enumInfo = parseEnumInfo(field_type, target);
            let enum_def = fieldDesp.$$enumInfo.enumDef;
            if (enum_def) {
                // 这几个属性要设置到data-field中
                fieldDesp.enumItemModel = enum_def.itemModel;
                // 缺省为true
                fieldDesp.enumEditable = !(enum_def.editable === false);
                // 缺省为false
                fieldDesp.enumIsTree = (enum_def.isTree === true);
            }
        } else if (SIMPLE_TYPES.indexOf(field_type) < 0) {
            fieldDesp.category = 'object';
        } else {
            fieldDesp.category = SIMPLE_TYPE_CATEGROIES[field_type];
        }
    } else {
        fieldDesp.category = 'complex';
    }

    // submit属性支持从环境中继承
    if (fieldDesp.submit === undefined && env.submit !== undefined)
        fieldDesp.submit = env.submit;
    if (fieldDesp.submit === 'false')
        fieldDesp.submit = false;
}
function parseEnumInfo(str, target) {
    let enum_fields;
    let pos = str.indexOf('[');
    if (pos >= 0) {
        enum_fields = str.substring(pos + 1, str.length - 1).split(',');
        enum_fields.forEach((enumField, index) => {
            enum_fields[index] = cue.stringUtil.removeBlankInEnd(enumField);
        });
        str = str.substring(0, pos);
    }
    let enum_def_name, enum_options;
    pos = str.indexOf(':', 5);
    if (pos >= 0) {
        enum_def_name = str.substring(5, pos);
        enum_options = str.substring(pos + 1);
    } else {
        enum_def_name = str.substring(5);
    }
    let enum_def;
    if (enum_def_name) {
        enum_def = defService.getEnumDef(enum_def_name, target);
    }
    return { enumOptions: enum_options, enumFields: enum_fields, enumDef: enum_def };
}
// 返回输出到data-field的内容
function processQFieldAttrOutput(fieldDesp, ele, attrOutput) {
    let data_field = {};
    if (ele) {
        fieldDesp.$$inputEle = {};
    }
    Object.keys(fieldDesp).forEach(function(attr) {
        // 内部字段不输出
        if (attr.substring(0, 2) !== '$$') {
            // 判断输出位置和输出字段
            let output = attrOutput[attr];
            let value = fieldDesp[attr];
            if (output) {
                if (cue.objectUtil.isArray(output)) {
                    output.forEach(it => {
                        processQFieldAttrOutput2(fieldDesp, it, attr, value, data_field, ele);
                    });
                } else {
                    processQFieldAttrOutput2(fieldDesp, output, attr, value, data_field, ele);
                }
            } else {
                processQFieldAttrOutput3(fieldDesp, attr, value, data_field, ele);
            }
        }
    });
    return data_field;
}
function processQFieldAttrOutput2(fieldDesp, output, attr, value, dataField, ele) {
    if ([ '', '#', '#&', '>', '>&' ].indexOf(output) >= 0) {
        processQFieldAttrOutput3(fieldDesp, output + attr, value, dataField, ele);
    } else {
        processQFieldAttrOutput3(fieldDesp, output, value, dataField, ele);
    }
}
function processQFieldAttrOutput3(fieldDesp, attr, value, dataField, ele) {
    if (attr[0] === '#') {
        // 输出到ele中
        if (ele) {
            domUtil.setEleAttribDefaultValue(ele, attr.substring(1), value);
        }
    } else if (attr[0] === '>') {
        // 输出到inputEle中
        if (fieldDesp.$$inputEle) {
            fieldDesp.$$inputEle[attr.substring(1)] = value;
        }
    } else {
        // 输出到dataField中
        dataField[attr] = value;
    }
}

// 指定属性，从src中获取，如果src中没有设置，从env中获取
function getAttrValueByEnv(env, src, attr) {
    return (src && htmlparser2.DomUtils.hasAttrib(src, attr)) ? src.attribs[attr] : env[attr];
}
// 如果dst中没有设置指定属性，从src中复制，如果src中没有设置，从env中复制
function setAttrsByEnv(env, src, dst, srcAttrs, dstAttrs, isDelete) {
    srcAttrs.forEach(function(attr, index) {
        let dst_attr = dstAttrs ? dstAttrs[index] : attr;
        domUtil.setEleAttribDefaultValue(dst, dst_attr, getAttrValueByEnv(env, src, attr));
        if (isDelete && src && htmlparser2.DomUtils.hasAttrib(src, attr)) {
            delete src.attribs[attr];
        }
    });
}

function handleVModel(ele, isRecur) {
    let v_model = htmlparser2.DomUtils.getAttributeValue(ele, 'v-model');
    if (v_model) {
        let pos = v_model.indexOf('.');
        // 如果v-model中没有'.'，不算表单中的数据
        if (pos >= 0) {
            let item_name = v_model.substring(0, pos);
            if (!_formItem[item_name]) {
                _formItem[item_name] = {};
            }
            _formItem[item_name][v_model.substring(pos + 1)] = undefined;
        }
    } else if (isRecur && ele.children && ele.children.length > 0) {
        // v-for下的v-model不算表单中的数据
        let v_for = htmlparser2.DomUtils.getAttributeValue(ele, 'v-for');
        if (!v_for) {
            ele.children.forEach(function(child) {
                handleVModel(child, true);
            });
        }
    }
}

function processFormItemEle(ele, env, indent)
{
    // 读取content属性
    let content = htmlparser2.DomUtils.getAttributeValue(ele, 'content');
    // 将content属性解析成字段描述
    let field_desp = parseFieldAbbreviation(content);
    delete ele.attribs.content;

    // 环境的class只能被ele替代。
    setAttrsByEnv(env, null, ele, [ 'form-class-class' ], [ 'class' ]);
    // 环境的样式可以叠加到ele上。
    if (env['form-item-style']) {
        domUtil.addStyle(ele, env['form-item-style'], false);
    }

    processQField(ele, field_desp, env, 'formItem');

    // 如果没有定义字段，直接返回
    let field = field_desp.field;
    if (!field)
        return;

    // 判断form-item是输入单字段还是多字段
    let fields = field.split('&');

    // 判断是否需要生成输入控件
    let content_ele, i;
    if (ele.children && ele.children.length > 0) {
        ele.children.forEach(function(child) {
            handleVModel(child, true);
        });
        return;
    }

    let field_type = field_desp.type;
    if (!field_type)
        return;

    let item_name = field_desp.item ? field_desp.item : env.name;
    if (!_formItem[item_name]) {
        _formItem[item_name] = {};
    }
    _formItem[item_name][(fields.length > 1) ? (fields[0] + '_' + fields[1]) : field] = undefined;

    let is_multiple = (fields.length > 1);
    let input_ele;
    let v_model_value = (field.indexOf('-') >= 0) ? item_name + "['" + field + "']" : item_name + '.' + field;
    let component_type = field_desp.component;
    let input_ele_size = getAttrValueByEnv(env, ele, 'size');
    let input_ele_attrs;
    switch (field_type)
    {
        case 'boolean':
            input_ele = domUtil.createTagEle(component_type || 'el-switch');
            input_ele_attrs = { 'v-model': v_model_value, 'on-text': '', 'off-text': '' };
            break;

        case 'int':
        case 'long':
            input_ele = domUtil.createTagEle(component_type || 'el-input-number');
            input_ele_attrs = { 'v-model': v_model_value, ':controls': 'false', size: input_ele_size };
            break;

        case 'string':
        case 'float':
        case 'double':
            input_ele = domUtil.createTagEle(component_type || 'el-input');
            input_ele_attrs = { 'v-model': v_model_value, size: input_ele_size };
            break;

        case 'text':
            input_ele = domUtil.createTagEle(component_type || 'el-input');
            input_ele_attrs = { 'v-model': v_model_value, type: 'textarea', ':autosize': '{minRows: 2,maxRows: 5}', size: input_ele_size };
            break;

        case 'date':
        case 'dateTime':
            input_ele = domUtil.createTagEle(component_type || 'el-date-picker');
            input_ele_attrs = { '&width': '100%', size: input_ele_size };
            if (is_multiple) {
                input_ele_attrs.type = (field_type === 'date') ? 'daterange' : 'datetimerange';
                input_ele_attrs['v-model'] = item_name + '.' + fields[0] + '_' + fields[1];
            } else {
                input_ele_attrs.type = (field_type === 'date') ? 'date' : 'datetime';
                input_ele_attrs['v-model'] = v_model_value;
            }
            break;

        case 'time':
            input_ele = domUtil.createTagEle(component_type || 'el-time-picker');
            input_ele_attrs = { '&width': '100%', size: input_ele_size };
            if (is_multiple) {
                input_ele_attrs['is-range'] = '';
                input_ele_attrs['v-model'] = item_name + '.' + fields[0] + '_' + fields[1];
            } else {
                input_ele_attrs['v-model'] = v_model_value;
            }
            break;

        case 'image':
            input_ele = domUtil.createTagEle(component_type || 'q-uploader');
            input_ele_attrs = { 'v-model': v_model_value };
            break;

        default:
            // 判断是否枚举
            if (field_desp.$$enumInfo)
            {
                let options_name = field_desp.$$enumInfo.enumOptions;
                let enum_def = field_desp.$$enumInfo.enumDef;
                if (enum_def) {
                    component_type = component_type || (enum_def.isTree ? 'el-cascader' : 'el-select');
                    let enum_item = { model: enum_def.itemModel, fields: field_desp.$$enumInfo.enumFields, optionsName: options_name };
                    // 枚举树的值一律后台查询。不可编辑的枚举，直接生成枚举项。
                    if (!enum_def.isTree && !enum_def.editable){
                        enum_item.items = enum_def.items;
                    }
                    _formItem.enumItems.push(enum_item);
                    options_name = options_name || getEnumItemOptionsName(enum_def.itemModel);
                }
                if (component_type) {
                    let pos = component_type.indexOf('/');
                    let component_para;
                    if (pos >= 0) {
                        component_para = component_type.substring(pos + 1);
                        component_type = component_type.substring(0, pos);
                    }
                    input_ele = domUtil.createTagEle(component_type);
                    if (component_type === 'el-cascader') {
                        input_ele_attrs = { 'v-model': v_model_value, 'change-on-select': '', ':props': 'cascaderProps',
                            ':options': options_name, clearable: '', '&width': '100%', size: input_ele_size };
                    } else if (component_type === 'el-radio-group') {
                        input_ele_attrs = { 'v-model': v_model_value, size: input_ele_size };
                        domUtil.prependChildIndent(input_ele, indent + domUtil.INDENT_PER_LEVEL);
                        let radio_ele = domUtil.createTagEle(component_para === 'button' ? 'el-radio-button' : 'el-radio',
                            { 'v-for': 'radio in '+ options_name, ':key': 'radio.id', ':label': 'radio.id' });
                        htmlparser2.DomUtils.appendChild(radio_ele, domUtil.createTextEle('{{radio.label}}'));
                        htmlparser2.DomUtils.appendChild(input_ele, radio_ele);
                        domUtil.appendChildIndent(input_ele, indent + domUtil.INDENT_PER_LEVEL);
                    } else {
                        input_ele_attrs = { 'v-model': v_model_value, filterable: '', clearable: '', '&width': '100%', size: input_ele_size };
                        domUtil.prependChildIndent(input_ele, indent + domUtil.INDENT_PER_LEVEL);
                        let option_ele = domUtil.createTagEle('el-option', { 'v-for': 'option in '+ options_name,
                            ':key': 'option.id', ':label': 'option.label', ':value': 'option.id' });
                        htmlparser2.DomUtils.appendChild(input_ele, option_ele);
                        domUtil.appendChildIndent(input_ele, indent + domUtil.INDENT_PER_LEVEL);
                    }
                }
            }
            else
            {
                // 对象
                input_ele = domUtil.createTagEle(component_type || 'entity-box');
                input_ele_attrs = { 'v-model': v_model_value, 'model': field_type, selector: field_type + '-select-list', size: input_ele_size };
            }
            break;
    }

    // 处理输入组件
    if (input_ele)
    {
        // 处理属性
        cue.objectUtil.copy(input_ele_attrs, field_desp.$$inputEle, false);
        Object.keys(field_desp.$$inputEle).forEach(attr => {
            domUtil.setEleAttribDefaultValue(input_ele, attr, field_desp.$$inputEle[attr]);
        });
        // 处理环境中继承的属性
        setAttrsByEnv(env, ele, input_ele, [ 'input-class', '@change', 'disabled' ], [ 'class', '@change', ':disabled' ], true);
        // 样式可以叠加
        let input_ele_style = getAttrValueByEnv(env, ele, 'input-style');
        if (input_ele_style) {
            domUtil.addStyle(input_ele, input_ele_style, false);
        }
        // 处理@change中的命名变量
        let change_value = input_ele.attribs['@change'];
        if (change_value) {
            change_value = change_value.replace(/\%\{field\}/g, field);
            input_ele.attribs['@change'] = change_value;
        }
        domUtil.prependChildIndent(ele, indent);
        htmlparser2.DomUtils.appendChild(ele, input_ele);
        domUtil.appendChildIndent(ele, indent);
    }
}
function createFormItemEle(content, env, indent)
{
    // create form item ele
    var ele = domUtil.createTagEle('q-form-item', { content: content });
    // parse content
    processFormItemEle(ele, env, indent);
    return ele;
}
function createColEle(content, span, env, indent)
{
    // create column ele
    var ele = domUtil.createTagEle('el-col', { ':span': span });
    // create form item ele
    if (content)
    {
        domUtil.prependChildIndent(ele, indent);
        var form_item_ele = createFormItemEle(content, env, indent + domUtil.INDENT_PER_LEVEL);
        htmlparser2.DomUtils.appendChild(ele, form_item_ele);
        domUtil.appendChildIndent(ele, indent);
    }
    return ele;
}
function createRowEle(content, env, indent)
{
    // judge if row contains single form item or multiple form items
    var contents = content.split(';');
    if (contents.length > 1)
    {
        // create row ele
        var ele =  domUtil.createTagEle('el-row', { ':gutter': 10 });
        // calculate column span
        var span = 24 / contents.length;
        for (var i = 0; i < contents.length; i++)
        {
            // create column ele
            domUtil.prependChildIndent(ele, indent);
            var col_ele = createColEle(contents[i], span, env, indent + domUtil.INDENT_PER_LEVEL);
            htmlparser2.DomUtils.appendChild(ele, col_ele);
        }
        domUtil.appendChildIndent(ele, indent);
        return ele;
    }
    else
    {
        return createFormItemEle(content, env, indent);
    }
}
const FORM_ITEM_ENV_ATTRS = [
    // 设置到el-form-item/q-form-item
    'form-item-class', 'form-item-style',
    // 设置到el-form-item/q-form-item下的data-field上
    'submit',
    // 设置到el-form-item/q-form-item下的input上
    'disabled', 'size', 'input-class', 'input-style', '@change' ];
// 从ele中读取环境变量
function processFormItemEnv(ele, env, extended)
{
    // 判断ele中是否设置了环境变量
    let ext = false;
    let has_attrs = { };
    FORM_ITEM_ENV_ATTRS.forEach(function(attr) {
        if (htmlparser2.DomUtils.hasAttrib(ele, attr))
        {
            ext = true;
            has_attrs[attr] = true;
        }
    });

    if (ext)
    {
        // 注意环境变量有了新值后，不能简单的覆盖旧值。需要生成一个新的环境变量，再覆盖，
        if (!extended)
            env = cue.objectUtil.extendObj(env);
        FORM_ITEM_ENV_ATTRS.forEach(function(attr) {
            if (has_attrs[attr])
            {
                env[attr] = htmlparser2.DomUtils.getAttributeValue(ele, attr);
                delete ele.attribs[attr];
            }
        });
    }
    return env;
}
function copyAttrExceptEnvAttr(ele, newEle) {
    Object.keys(ele.attribs).forEach(function(attr) {
        if (FORM_ITEM_ENV_ATTRS.indexOf(attr) < 0 && attr !== 'content') {
            domUtil.setEleAttribDefaultValue(newEle, attr, ele.attribs[attr]);
        }
    });
}
function processTable(ele, indent) {
    // 处理data-desp
    let q_items = htmlparser2.DomUtils.getAttributeValue(ele, 'data-desp');
    q_items = cue.stringUtil.parseJsonLikeObject(q_items);
    if (htmlparser2.DomUtils.hasAttrib(ele, ':data')) {
        q_items.name = htmlparser2.DomUtils.getAttributeValue(ele, ':data');
    } else {
        if (!q_items.name) {
            q_items.name = 'items';
        }
        ele.attribs[':data'] = q_items.name;
    }
    ele.attribs['data-desp'] = cue.stringUtil.serializeEleAttr(q_items);

    // 处理列的缩写
    let columns = htmlparser2.DomUtils.getAttributeValue(ele, 'columns');
    if (!columns)
        return;
    delete ele.attribs.columns;

    // 读取非缩写的列定义
    let existed_columns = ele.children.filter(function(child) {
        return child.name === 'el-table-column';
    });
    existed_columns.forEach(function(colEle) {
        htmlparser2.DomUtils.removeElement(colEle);
    });

    // 读取indent元素
    let last_child;
    if (ele.children.length > 0) {
        last_child = ele.children[ele.children.length - 1];
        if (last_child.type === 'text')
            htmlparser2.DomUtils.removeElement(last_child);
        else
            last_child = null;
    }

    let env = { target: q_items.target, targets: q_items.targets };
    if (!env.target && env.targets) {
        env.target = env.targets[0].target;
    }

    columns = columns.split('|');
    let col_desp, found_col_idx, col_ele;
    columns.forEach(function(colAbbre) {

        domUtil.prependChildIndent(ele, indent);

        // 判断col信息的简写中是否定义了多个target
        if (q_items.targets && colAbbre.indexOf(';') >= 0) {
            col_desp.targets = [];
            let col_parts = colAbbre.split(';');
            col_parts.forEach(function(colPart) {
                col_desp.targets.push(parseFieldAbbreviation(colPart));
            });
            // col信息中包含了多个target时，按照第一个target的字段处理占位
            col_desp.field = col_desp.targets[0].field;
        } else {
            col_desp = parseFieldAbbreviation(colAbbre);
        }

        // 判断columns中定义的列，是否占位符
        found_col_idx  = existed_columns.findIndex((colEle) => { return (col_desp.field === htmlparser2.DomUtils.getAttributeValue(colEle, 'prop')); });
        if (found_col_idx >= 0) {
            col_ele = existed_columns[found_col_idx];
            existed_columns.splice(found_col_idx, 1);
        } else {
            col_ele = domUtil.createTagEle('el-table-column');
        }

        processQField(col_ele, col_desp, env, 'column');
        if (found_col_idx < 0) {
            let templ_ele;
            if (col_desp.category === 'date') {
                templ_ele = htmlparser2.parseDOM(`
                    <template scope="scope">
                        <span>{{$cue.dateUtil.format(scope.row.${col_desp.field}, '${col_desp.type}')}}</span>
                    </template>
                    `, DOM_PARSE_OPTS);
                htmlparser2.DomUtils.appendChild(col_ele, templ_ele[1]);
            } else if (col_desp.category === 'boolean') {
                templ_ele = htmlparser2.parseDOM(`
                    <template scope="scope">
                        <span>{{scope.row.${col_desp.field} ? '是' : '否'}}</span>
                    </template>
                    `, DOM_PARSE_OPTS);
                htmlparser2.DomUtils.appendChild(col_ele, templ_ele[1]);
            } else if (col_desp.category === 'enum' || col_desp.category === 'object') {
                templ_ele = htmlparser2.parseDOM(`
                    <template scope="scope">
                        <span>{{$cue.objectUtil.getObjectLabel(scope.row.${col_desp.field})}}</span>
                    </template>
                    `, DOM_PARSE_OPTS);
                htmlparser2.DomUtils.appendChild(col_ele, templ_ele[1]);
            }
        }

        // 处理列的缺省排序
        if (!htmlparser2.DomUtils.hasAttrib(col_ele, ':sortable')) {
            if (SORT_TYPES.indexOf(col_desp.type) >= 0 || col_desp.category === 'enum') {
                domUtil.setEleAttribDefaultValue(col_ele, 'sortable', 'custom');
            }
        }
        htmlparser2.DomUtils.appendChild(ele, col_ele);
    });

    // columns中没有出现的列加在最后
    existed_columns.forEach(function(colEle) {
        domUtil.prependChildIndent(ele, indent);
        col_desp = { };
        processQField(colEle, col_desp, env, 'column');
        htmlparser2.DomUtils.appendChild(ele, colEle);
    });
    if (last_child)
        htmlparser2.DomUtils.appendChild(ele, last_child);
    else
        domUtil.appendChildIndent(ele, indent);
}

function processEles(eles, env, inVFor)
{
    if (!eles || eles.length === 0)
        return;
    var content, new_ele, handle_children, indent;
    var old_env = env;
    for (var i = 0; i < eles.length; i++)
    {
        var ele = eles[i];
        if (ele.type !== "tag")
            continue;
        // 如果不在v-for中，处理v-model
        let in_vfor;
        if (inVFor) {
            in_vfor = true;
        } else {
            in_vfor = Boolean(htmlparser2.DomUtils.getAttributeValue(ele, 'v-for'));
            handleVModel(ele, false);
        }
        handle_children = true;
        switch (ele.name)
        {
            case 'el-form':
                // modify environment and dispatch to children
                env = cue.objectUtil.extendObj(env);
                processFormItemEnv(ele, env, true);
                // 判断el-form是否有onsubmit属性，如果没有，设置onsubmit，禁止在el-form中只有一个单行输入时，回车不会导致提交表单。
                if (!htmlparser2.DomUtils.hasAttrib(ele, 'onsubmit')) {
                    ele.attribs['onsubmit'] = 'return false;';
                }
                let q_item = htmlparser2.DomUtils.getAttributeValue(ele, 'data-desp');
                let q_item_name = htmlparser2.DomUtils.getAttributeValue(ele, ':model');
                if (q_item)
                    q_item = cue.stringUtil.parseJsonLikeObject(q_item);
                else
                    q_item = {};
                env.target = q_item.target;
                if (q_item_name) {
                    if (q_item_name !== q_item.name) {
                        if (q_item.name) {
                            console.error('data-desp.name is not equal with :model: ' + q_item_name + ' != ' + q_item.name);
                        }
                        q_item.name = q_item_name;
                        ele.attribs['data-desp'] = cue.stringUtil.serializeEleAttr(q_item, false);
                    }
                } else {
                    q_item_name = q_item.name || 'item';
                    if (!q_item.name) {
                        q_item.name = q_item_name;
                        ele.attribs['data-desp'] = cue.stringUtil.serializeEleAttr(q_item, false);
                    }
                    domUtil.setEleAttribDefaultValue(ele, ':model', q_item_name);
                }
                env.name = q_item_name;
                // 如果有content属性，在下面构造一个box，放置content属性
                content = htmlparser2.DomUtils.getAttributeValue(ele, 'content');
                if (content) {
                    new_ele = domUtil.createTagEle('box', { content });
                    htmlparser2.DomUtils.appendChild(ele, new_ele);
                    delete ele.attribs.content;
                }
                break;

            case 'box':
                env = processFormItemEnv(ele, env);
                content = htmlparser2.DomUtils.getAttributeValue(ele, 'content');
                if (content)
                {
                    indent = domUtil.getEleIndent(ele);
                    var rows = content.split("|");
                    for (var j = 0; j < rows.length; j++)
                    {
                        // create row element
                        new_ele = createRowEle(rows[j], env, indent);
                        htmlparser2.DomUtils.prepend(ele, new_ele);
                        // create newline element
                        if (indent && j !== rows.length - 1)
                        {
                            new_ele = domUtil.createTextEle(indent);
                            htmlparser2.DomUtils.prepend(ele, new_ele);
                        }
                    }
                    i = ele.parent.children.indexOf(ele) - 1;
                    // delete box element
                    htmlparser2.DomUtils.removeElement(ele);
                    handle_children = false;
                }
                break;

            case 'el-row':
                env = processFormItemEnv(ele, env);
                content = htmlparser2.DomUtils.getAttributeValue(ele, 'content');
                if (content)
                {
                    new_ele = createRowEle(content, env, domUtil.getEleIndent(ele));
                    copyAttrExceptEnvAttr(ele, new_ele);
                    htmlparser2.DomUtils.replaceElement(ele, new_ele);
                    handle_children = false;
                }
                break;

            case 'el-col':
                env = processFormItemEnv(ele, env);
                content = htmlparser2.DomUtils.getAttributeValue(ele, 'content');
                if (content)
                {
                    new_ele = createFormItemEle(content, env, domUtil.getEleIndent(ele));
                    copyAttrExceptEnvAttr(ele, new_ele);
                    htmlparser2.DomUtils.appendChild(ele, new_ele);
                    handle_children = false;
                }
                break;

            case 'el-form-item':
            case 'q-form-item':
                processFormItemEle(ele, env, domUtil.getEleIndent(ele));
                handle_children = false;
                break;

            case 'el-table':
                processTable(ele, domUtil.getEleIndent(ele));
                handle_children = false;
                break;

            default:
                break;
        }
        if (handle_children)
            processEles(ele.children, env, in_vfor);
        // 恢复env
        env = old_env;
    }
}

let _formItem;
let _formItemInitScript;
function createEnumItemsScript(info) {
    // 确定输出字段
    let output_fields = info.fields || [ 'id', 'name', 'label' ];
    let str = '[';
    if (info.items) {
        let last_idx = info.items.length - 1;
        info.items.forEach((item, idx) => {
            str += '\r\n  { ';
            output_fields.forEach((field, index) => {
                // 判断是否强制输出或者有值需要输出
                if (info.fields || item[field] !== undefined) {
                    str += field + ': ' + cue.stringUtil.serializeJsonValue(item[field]);
                }
                if (index !== output_fields.length - 1) {
                    str += ', ';
                }
            });
            str += ' }';
            if (last_idx !== idx) {
                str += ',';
            }
        });
    }
    str += '\r\n]';
    return str;
}
// 根据_formItem生成_formItemInitScript
function createFormItemInitScript() {
    let insert_form_item = false;
    _formItemInitScript = '';
    Object.keys(_formItem).forEach(formItemKey => {
        let form_item_value = _formItem[formItemKey];
        if (formItemKey === 'enumItems') {
            // 即使没有枚举，仍然要生成_selectOptions_init，否则可能会造成一些模板文件无法正常工作。
            _formItemInitScript += '\r\nlet _selectOptions_init = {';
            let options_script = '';
            let select_options_empty = true;
            form_item_value.forEach((info) => {
                if (info.optionsName) {
                    options_script += '\r\n' + info.optionsName + ': ' + createEnumItemsScript(info) + ';';
                } else {
                    _formItemInitScript += '\r\n ' + info.model + ': ' + createEnumItemsScript(info) + ',';
                    select_options_empty = false;
                }
            });
            // 去掉结尾的','
            if (!select_options_empty) {
                _formItemInitScript = _formItemInitScript.substring(0, _formItemInitScript.length - 1);
            }
            _formItemInitScript += '\r\n};';
            // 如果没有枚举，代码中又没有使用_selectOptions_init，lint会生成无意义的"未使用"错误，所以加一行代码防止lint错误
            if (select_options_empty) {
                _formItemInitScript += '\r\n_selectOptions_init;';
            }
            _formItemInitScript += options_script;
        } else {
            insert_form_item = true;
            _formItemInitScript += '\r\nlet _' + formItemKey + '_init = {';
            Object.keys(form_item_value).forEach((key, index, arr) => {
                _formItemInitScript += '\r\n  ';
                if (key.indexOf('-') >= 0) {
                    _formItemInitScript += "'" + key + "'";
                } else {
                    _formItemInitScript += key;
                }
                _formItemInitScript += ': ' + String(form_item_value[key]);
                if (index !== arr.length - 1) {
                    _formItemInitScript += ',';
                }
            });
            _formItemInitScript += '\r\n};';
        }
    });
    return insert_form_item;
}

const _namedVarRegex = /\%\{([^\}]+)\}/g;
function replaceNamedVar(content) {
    _namedVarRegex.lastIndex = 0;
    let ret = _namedVarRegex.exec(content);
    let start = 0;
    let new_content = '';
    while (ret) {
        let handled = false;
        if (ret[1].indexOf('enum:') === 0) {
            let enum_info = parseEnumInfo(ret[1]);
            if (enum_info.enumDef) {
                let replace_part = createEnumItemsScript({ items: enum_info.enumDef.items, fields: enum_info.enumFields });
                new_content += content.substring(start, ret.index) + replace_part;
                start = ret.index + ret[0].length;
                handled = true;
            }
        }
        // 找不到，输出错误
        if (handled) {
            console.log('qbuild: failded to replace named var - ' + ret[1]);
        }
        ret = _namedVarRegex.exec(content);
    }
    new_content += content.substring(start);
    return new_content;
}

let extendVue = {
    extendVue(fileContent) {
        // 找到html模板部分
        let templ_regexp = /\<template\>([\s\S]+)\<\/template\>/;
        let templ_regexp_ret = templ_regexp.exec(fileContent);
        // 如果没有html模板，无需扩展
        if (!templ_regexp_ret) {
            return fileContent;
        }
        let templ_content = templ_regexp_ret[1];
        // 将html模板内容转换成dom
        let dom = htmlparser2.parseDOM(templ_content, DOM_PARSE_OPTS);
        _formItem = { enumItems: [ ] };
        // 处理dom中所有元素节点
        processEles(dom, { });
        // 处理完后，将dom树重新串行化
        let templ_content2 = dom.map(ele => dom_serialize(ele)).join("");
        // 将处理完成的内容替换处理前的内容
        let new_content = fileContent.substring(0, templ_regexp_ret.index) + '\<template\>' + templ_content2 +
            '\<\/template\>' + fileContent.substring(templ_regexp_ret.index + templ_regexp_ret[0].length);

        // 构造表单数据的初始脚本
        if (createFormItemInitScript()) {
            // 找到插入位置
            let pos = new_content.indexOf('export default');
            if (pos >= 0) {
                new_content = new_content.substring(0, pos) + _formItemInitScript + '\r\n' + new_content.substring(pos);
            } else {
                console.log('qbuild: failed to find position to insert form item');
            }
        }
        return replaceNamedVar(new_content);
    },

    // 扩展vue文件
    extendVueFile(src, dst) {
        console.log('qbuild: extend ' + src);
        // 读入vue文件
        let file_content = fs.readFileSync(src, 'utf8');
        fs.writeFileSync(dst, this.extendVue(file_content), 'utf8');
    },

    extendMouldFile(mouldPath, src, dst) {
        console.log('\r\nqbuild: extend ' + mouldPath);
        // 读入mould.json文件
        let file_content = fs.readFileSync(mouldPath, 'utf8');
        let mould = JSON.parse(file_content);
        let t = this;
        Object.keys(mould).forEach(function(key) {
            // 确定目标文件路径
            let dst_path = path.join(dst, key);
            // 确定模板文件路径
            let templ_path = path.join(src, mould[key].template);
            // 读入模板文件
            let templ = fs.readFileSync(templ_path, 'utf8');

            // 修改模块文件中import模块的相对路径
            templ = templ.replace(/^([ \t]*import[^\']+\')([^\']+)(\';)$/gm, (str, beforePath, relPath, afterPath) => {
                // 判断是否相对路径
                if (relPath[0] === '.') {
                    // 计算import模块的绝对路径
                    let import_path = path.join(path.dirname(templ_path), relPath);
                    // 注意：vue下的模块，构建后会到vue_dist下，所以这里要生成构建后的目录
                    import_path = import_path.replace(path.sep + 'vue' + path.sep, path.sep + 'vue_dist' + path.sep);
                    // 计算从目标文件路径到模块路径的相对路径并返回
                    let ret = path.relative(path.dirname(dst_path), import_path);
                    // 检查相对路径是否..或者.开始
                    if (ret[0] === '.') {
                        // 路径中的分隔符改成/
                        ret = ret.replace(/\\/g, '/');
                    } else {
                        ret = './' + ret;
                    }
                    return (beforePath + ret + afterPath);
                } else {
                    return str;
                }
            });

            // 替换模板中的参数
            let paras = mould[key].paras;
            templ = templ.replace(/\$\{([^\}]+)\}/g, (str, paraKey) => {
                let pos = paraKey.indexOf('|');
                let para_key = (pos >= 0) ? paraKey.substring(0, pos) : paraKey;
                if (paras.hasOwnProperty(para_key)) {
                    return paras[para_key];
                } else if (pos >= 0) {
                    // 返回定义的缺省值
                    return paraKey.substring(pos + 1);
                } else {
                    return str;
                }
            });

            console.log('qbuild: extend ' + dst_path.replace(path.sep + 'vue_dist' + path.sep, path.sep + 'vue' + path.sep));
            fs.writeFileSync(dst_path, t.extendVue(templ), 'utf8');
        });
        console.log('');
    }
};

module.exports = extendVue;
