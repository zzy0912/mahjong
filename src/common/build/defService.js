// 处理定义
let fs = require('fs');
let path = require('path');

let modelDefCache = { };

let defService = {
    clearModelDefCache(model) {
        if (model) {
            delete modelDefCache[model];
        } else {
            modelDefCache = {};
        }
    },

    getModelDef(model) {
        if (!model) {
            return null;
        }
        if (modelDefCache[model] === undefined) {
            let def_path = path.join(__dirname, '../../../definition/model/' + model + '.json');
            if (!fs.existsSync(def_path)) {
                def_path = path.join(__dirname, '../../../src/definition/model/' + model + '.json');
            }
            if (fs.existsSync(def_path)) {
                let def_content = fs.readFileSync(def_path, 'utf8');
                modelDefCache[model] = JSON.parse(def_content);
            } else {
                modelDefCache[model] = null;
                console.log('qbuild: failed to get model def - ' + model);
            }
        }
        return modelDefCache[model];
    },

    getFieldDef(modelDef, field) {
        if (!field || !modelDef) {
            return modelDef;
        }
        let fields = field.split('.');
        let field_def = modelDef;
        for (let i = 0; i < fields.length; i++) {
            if (!field_def.fields) {
                return null;
            }
            field_def = field_def.fields.find(n => n.name === fields[i]);
            if (!field_def) {
                return field_def;
            }
        }
        return field_def;
    },

    getEnumDef(enumName, defModel) {
        let enum_model, enum_name;
        let pos = enumName.indexOf('.');
        if (pos >= 0) {
            enum_model = enumName.substring(0, pos);
            enum_name = enumName.substring(pos + 1);
        } else {
            enum_model = defModel;
            enum_name = enumName;
        }
        let model_def = this.getModelDef(enum_model);
        if (model_def && model_def.enums) {
            return model_def.enums.find(n => n.name === enum_name);
        }
        return null;
    }
};

module.exports = defService;
