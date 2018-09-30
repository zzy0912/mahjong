angular.module("cue").controller('model_org_item', [ 
    "$scope", 
    "$compile", 
    "$q", 
    "$http", 
    "$element", 
    "arrayUtil", 
    "pageService", 
    "ajaxService",
    "permService",
    "defService",
    "enumService",
function ($scope, $compile, $q, $http, $ele, arrayUtil, pageService, ajaxService, permService, defService, enumService) {
    // 用来存放控制器中所使用的全局变量
    var GLOBAL = {
        isItemLoaded: false,
        isEditEnumitem: false,
        enumItemMap: {},
        permInheritWidget: {},
        modelParaContents: { isInherit: false, widgets: [] },
        permGrid: undefined,
        enumGrid: undefined,
        selectedEnum: undefined,
        enumListWidget: undefined,
        view: pageService.getViewByNode($ele[0])
    };

    GLOBAL.org = GLOBAL.view.viewObj;
    $scope.initReady = $q.defer();

    pageService.registerController("model_org_item", $scope, $ele);

    $scope.modelParaList = [];

    GLOBAL.view.widgetReady.then(function () {
        var tabs_id = GLOBAL.view.getGlobalId("orgTabWidget");
    	var tabs_node = document.getElementById(tabs_id);
        var  init_func = function (tab) {
            if (tab.label === "工作项" && !GLOBAL.isItemLoaded) {
                // 获取各个表格控件
                GLOBAL.permGrid = GLOBAL.view.getWidgetByLocalId("permRuleGrid").object;
                GLOBAL.enumGrid = GLOBAL.view.getWidgetByLocalId('enumGrid').object;
                GLOBAL.isItemLoaded = true;
                // 初始化工作项视图信息
                initWorkItemInfo();
                // 获取模型参数
                _getModelPara();

                // 修改完数据后, 清空对应枚举的缓存
                GLOBAL.enumGrid.onDataReady = function (node) {
                    var arr = node.type.split("_");
                    var enumModel = arr[0];
                    var enumName = arr[1];
                    enumService.clearEnumCfg(enumModel, enumName);
                };
            }
        }
        // 判断启动时是否权限页面
        var tabs_scope = angular.element(tabs_node).scope();
        init_func(tabs_scope.selectedTab);
        pageService.on("tabChanged", tabs_node, tabs_node, function(event) {
            init_func(event.newTab);
        });
    });
    
    $scope.changeModel = function (selectName) {
        var i = 0, l = $scope.models.length;
        for ( ; i < l; i++ ) {
            if ( $scope.models[i].name === selectName ) {
                $scope.selectedModel = $scope.models[i];
                break;
            }
        }
        refreshWorkItemView();
    };

    function initWorkItemInfo () {
        var sys_def = defService.getSystemDef(), enumWidgetReady;
        $scope.models = [];
        // 获取可设置的模型列表
        for (var i = 0, len = sys_def.models.length; i < len; i++) {
            if (sys_def.models[i].enableSetup) {
                var model = sys_def.models[i];
                model.id = i;
                $scope.models.push(model);
            }
        }

        if (!$scope.selectedModel)
            $scope.selectedModel = $scope.models instanceof Array ? $scope.models[0] : undefined;

        // 初始化存放枚举列表的控件
        enumWidgetReady = _createEnumsWidget($scope.enums);

        enumWidgetReady.then(function () {
            refreshWorkItemView(true);
        });
    }

    function refreshWorkItemView (isInit) {
        // 获取被选中的模型的定义
        defService.getTargetDefAsync($scope.selectedModel.name).then(function (def) {
            var isRefreshEnumGrid;
            if ($scope.enums && $scope.enums[0] && $scope.enums[0].label === def.enums[0] && def.enums[0].label) {
                isRefreshEnumGrid = true;
            }
            $scope.enums = def.enums;
            $scope.permRuleActions = def.permission && def.permission.actions;
            GLOBAL.selectedEnum = $scope.enums[0];
            GLOBAL.enumListWidget.store.setData(def.enums);
            if (GLOBAL.enumListWidget && def.enums.length) {
                if (!isInit)
                    GLOBAL.enumListWidget.set("value", def.enums[0].label);
                GLOBAL.enumGrid.set("visibility", "visible");
            } else {
                if (!isInit) 
                    GLOBAL.enumListWidget.set("value", "该模型没有枚举");
                GLOBAL.enumGrid.set("visibility", "hidden");
            }
            if (isRefreshEnumGrid) {
                for ( var i = 0, l = $scope.enums.length; i < l; i++ ) {
                    if ( $scope.enums[i].label === GLOBAL.enumListWidget.value ) {
                        GLOBAL.selectedEnum = $scope.enums[i];
                        GLOBAL.enumGrid.axisX.refresh();
                        GLOBAL.enumGrid.action.refresh();
                    }
                }
            }
            // 刷新权限视图
            if (GLOBAL.permGrid)
                GLOBAL.permGrid.refreshAxisY();

            $scope.initReady.resolve();
        });

        // 获取被选中的模型的模型配置的定义
        // defService.getTargetDefAsync($scope.selectedModel.name + "_config").then(function (def) {
        //     for ( var i = 0, l = def.fields.length; i < l; i++ ) {
        //         if ( def.fields[i].isModelConfig ) {
        //             var object = {
        //                 name: def.fields[i].name,
        //                 label: def.fields[i].label,
        //                 type: def.fields[i].type,
        //                 isSendEmail: def.fields[i].isSendEmail
        //             };
        //             $scope.modelParaList.push(object);
        //         }
        //     }
        // });
    }

    $ele.on("userInput", function (event) {
        require(["dijit/registry"], function (registry) {
            var widget = registry.byNode(event.target);
            if ( event.target === GLOBAL.enumListWidget.domNode ) {
                for ( var i = 0, l = $scope.enums.length; i < l; i++ ) {
                    if (!$scope.enums[i].label) {
                        throw(new Error("枚举项未定义label"));
                    }

                    if ( $scope.enums[i].label === GLOBAL.enumListWidget.value ) {
                        GLOBAL.selectedEnum = $scope.enums[i];
                        GLOBAL.enumGrid.action.refresh();
                    }
                }
            }

            // 模型参数是否继承
            if ( widget.name === "modelParaInheritWidget" ) {
                GLOBAL.modelParaContents.isInherit = widget.wCheckBox.getValue() ? true : false;
                _setModelParaWidgetDisable();
            }

            // 如果是模型参数中的控件
            if ( widget.cField && widget.cField.split("modelPara_").length === 2 ) {
                var value = widget.getValue();
                if ( _isModelParaChange(widget.cField, value) ) {
                    if ( !GLOBAL.modelParaContents[widget.cField].change ) {
                        GLOBAL.modelParaContents[widget.cField].change = angular.copy(GLOBAL.modelParaContents[widget.cField].oldContent);
                    }
                    GLOBAL.modelParaContents[widget.cField].change.value = value;
                } else {
                    GLOBAL.modelParaContents[widget.cField].change = null;
                }
            }
        });
    });

    /**************权限部分**************/

    $scope.createInheritPlugin = permService.createInheritPlugin;

    // 继承下来的权限规则无法编辑
    $scope.refreshBtnDisabled = permService.refreshBtnDisabled

    $scope.createPermRuleGridAxisYCustomQuery = function () {
        var t = this;
        var defer = $q.defer();
        $scope.initReady.promise.then(function () {
            permService.createPermRuleGridAxisYCustomQuery.call(t, GLOBAL.org, $scope.selectedModel.name, $scope.permRuleActions, defer);
        });
        return defer.promise;
    }

    $scope.createPermRule = function (para) {
        permService.editPermRule(para, GLOBAL.org, $scope.selectedModel.name, false);
    };

    $scope.modifyPermRule = function (para) {
        permService.editPermRule(para, GLOBAL.org, $scope.selectedModel.name, true);
    }

    /**************枚举部分**************/

    function _createNodeByList (list) {
        var nodes = [];

        for ( var i = 0, l = list.length; i < l; i++ )  {
            nodes.push(this.def.createNodeByValue(null, list[i], GLOBAL.selectedEnum.itemModel, false, null, false));
        }
        return nodes;
    }

    $scope.createEnumGridAxisYCustomQuery = function () {
        var deferY = $q.defer(), enumItems, list;
        var t = this;

        // 修改axisY.def的Node
        this.def.nodes[0].subnodes[0].filterTarget = GLOBAL.selectedEnum.itemModel;
        this.def.nodes[0].subnodes[0].type = GLOBAL.selectedEnum.itemModel;
        this.def.nodes[1].type = GLOBAL.selectedEnum.itemModel;
        if ( GLOBAL.selectedEnum.itemModel in GLOBAL.enumItemMap && !GLOBAL.isEditEnumitem ) {
            enumItems = GLOBAL.enumItemMap[GLOBAL.selectedEnum.itemModel];
            list = _createNodeByList.call(this, enumItems);

            deferY.resolve({ totalCount: list.length, list: list });
        } else {
            var callPara = {
                target: GLOBAL.selectedEnum.itemModel,
                retFields: ["name", "defaultFlag", "color", "bgColor", "enBg"],
                count: -1
            };
            ajaxService.call("model", "getEntities", callPara, "获取枚举数据失败").then(function (result) {
                list = _createNodeByList.call(t, result.list);
                GLOBAL.enumItemMap[GLOBAL.selectedEnum.itemModel] = result.list;

                deferY.resolve({ totalCount: list.length, list: list });
            });

            // 需要提前异步获取指定对象的定义,以便QueryGrid能够用同步获取定义
            defService.getTargetDefAsync(GLOBAL.selectedEnum.itemModel);
            GLOBAL.isEditEnumitem = false;
        }

        return deferY.promise;
    };

    $scope.createEnumGridAxisXCustomQuery = function () {
        var deferX = $q.defer(), list, t = this;
        $scope.initReady.promise.then(function () {
            defService.getTargetDefAsync(GLOBAL.selectedEnum && GLOBAL.selectedEnum.itemModel).then(function (def) {
                if (!def) 
                    return;
                t.def = t.widget.queryDef.axisX;
                t.def.useModels = [def.name];

                // 创建子节点
                var env_var_map = t.widget ? t.widget.getEnvVarMap() : null;
                var nodes = t.def.createNodeChildren(null, env_var_map);

                // 重写部分字段的decorator、formatter
                for ( var i = 0, l = nodes.length; i < l; i++ ) {
                    if ( nodes[i].type === ".color" || nodes[i].type === ".bgColor" ) {
                        nodes[i].nodeDef.decorator = function(cellValue) {
                            return '<div style="display: inline-block; border: 1px solid black; ' +
                             'width: 20px; height: 20px; background-color: ' + cellValue + '"></div>' + cellValue;
                        };
                        nodes[i].nodeDef.editor = "dijit/ColorPalette";
                    } else if ( nodes[i].type === ".label" ) {
                        nodes[i].nodeDef.decorator =  function(rowValue) {
                            var ret = "<div style='width: 100%; height: 25px; line-height: 25px; ";
                            if (rowValue.color)
                                ret += "color: " + rowValue.color + "; ";
                            if (rowValue.enBg && rowValue.bgColor)
                                ret += "background-color: " + rowValue.bgColor + "; ";
                            ret += "' >" + (rowValue.label ? rowValue.label : "") + "</div>";
                            return ret;
                        };
                        nodes[i].nodeDef.formatter = function(rowNode) {
                            return rowNode.value;
                        };
                    }
                }
                deferX.resolve({ totalCount: nodes.length, list: nodes });
            });
        });
        return deferX.promise;
    };

    function _createEnumsWidget (data) {
        var widgetId = GLOBAL.view.getGlobalId("enumList"), enumWidgetReady = $q.defer();

        require(["fusion/ui/input/ComboBox", "dojo/store/Memory"], function (ComboBox, Memory) {
            
            var store = new Memory({
                data: data
            });
            GLOBAL.enumListWidget = new ComboBox({
                store: store,
                editable: true,
                searchAttr: "label",
                value: GLOBAL.selectedEnum && GLOBAL.selectedEnum.label
            }, widgetId);
            GLOBAL.enumListWidget.startup();
            enumWidgetReady.resolve();
        });

        return enumWidgetReady.promise;
    }

    $scope.addEnumItem = function (para) {
        para.widget.action.create(null, GLOBAL.selectedEnum.itemModel, true);
        GLOBAL.isEditEnumitem = true;
    };

    $scope.deleteEnumItem = function (para) {
        if (para.selectedNodes && para.selectedNodes.length > 0)
            para.widget.action.delete(para.selectedNodes[0]);
        GLOBAL.isEditEnumitem = true;
    };

    $scope.saveModelPara = function () {
        var entity = {};
        if ( GLOBAL.modelParaContents.isInherit ) {
            entity.isInherit = true;
        } else {
            for ( var i in GLOBAL.modelParaContents ) {
                if ( GLOBAL.modelParaContents[i].change ) {
                    entity[GLOBAL.modelParaContents[i].change.name] = GLOBAL.modelParaContents[i].change.value;
                }
            }
        }

        var callPara = {
            org: GLOBAL.org.id,
            target: $scope.selectedModel.name + "_config",
            entity: entity
        };
        ajaxService.call("model", "updateModelPara", callPara, "模型参数更新失败").then(function (result) {

        });
    };

    /**************模型参数部分**************/

    function _getModelPara () {
        var callPara = {
            org: GLOBAL.org.id,
            target: $scope.selectedModel.name
        };
        ajaxService.call("model", "getModelPara", callPara, "获取模型参数失败").then(function (result) {
            GLOBAL.modelParaContents.result = result;
            for ( var i = 0, l = $scope.modelParaList.length; i < l; i++ ) {
                $scope.modelParaList[i].value = result[$scope.modelParaList[i].name];
            }

            _setModelParaWidgetDisable();
        });
    }

    function _createModelParaWidgets () {
        require([
            "fusion/ui/input/NumberTextBox",
            "fusion/ui/input/TextBox",
            "fusion/ui/input/DateTimeBox",
            "fusion/ui/input/DateUnitTextBox",
            "fusion/ui/input/ComboBox",
            "dojo/store/Memory"
        ], function (NumberTextBox, TextBox, DateTimeBox, DateUnitTextBox, ComboBox, Memory) {
            for ( var i = 0, l = $scope.modelParaList.length; i < l; i++ ) {
                var widget;
                var widgetId = GLOBAL.view.getGlobalId("modelPara_" + $scope.modelParaList[i].name);
                var cField = "modelPara_" + $scope.modelParaList[i].name;
                var editable = true;
                GLOBAL.modelParaContents[cField] = { oldContent: angular.copy($scope.modelParaList[i]) };
                $("#" + widgetId).html("");

                switch ( $scope.modelParaList[i].type ) {
                    case "int":
                        widget = new NumberTextBox({
                            value: $scope.modelParaList[i].value,
                            editable: editable,
                            cField: cField
                        });
                        widget.placeAt(widgetId);
                        widget.startup();
                        GLOBAL.modelParaContents.widgets.push(widget);
                       break;
                    case "string":
                        widget = new TextBox({
                            value: $scope.modelParaList[i].value,
                            editable: editable,
                            cField: cField
                        });
                        widget.placeAt(widgetId);
                        widget.startup();
                        GLOBAL.modelParaContents.widgets.push(widget);
                        break;
                    case "date":
                        widget = new DateTimeBox({
                            value: $scope.modelParaList[i].value,
                            editable: editable,
                            cField: cField
                        });
                        widget.placeAt(widgetId);
                        widget.startup();
                        GLOBAL.modelParaContents.widgets.push(widget);
                        break;
                    case "boolean":
                        //  判断是否为发送email的字段
                        if ( $scope.modelParaList[i].isSendEmail ) {
                            widgetId = GLOBAL.view.getGlobalId("modelPara_email_" + $scope.modelParaList[i].name);
                            $("#" + widgetId).html("");
                        }
                        var store = new Memory({
                            data: [
                                { value: "是" },
                                { value: "否" }
                            ]
                        });
                        widget = new ComboBox({
                            cField: cField,
                            value: $scope.modelParaList[i].value,
                            store: store,
                            searchAttr: "value",
                            editable: editable
                        });
                        widget.placeAt(widgetId);
                        widget.startup();
                        GLOBAL.modelParaContents.widgets.push(widget);
                        break;
                    case "dateUnit":
                         widget = new DateUnitTextBox({
                            unitList: [
                                { value: "秒" },
                                { value: "分钟" },
                                { value: "小时" },
                                { value: "日" },
                                { value: "周" }
                            ],
                            content: $scope.modelParaList[i].value,
                            cField: cField,
                            editable: editable
                        });
                        widget.placeAt(widgetId);
                        widget.startup();
                        GLOBAL.modelParaContents.widgets.push(widget);
                        break;
                }
            }
        });
    }

    function _setModelParaWidgetDisable () {
        var widgets = GLOBAL.modelParaContents.widgets;
        var editable = $scope.viewState === "read" ? false : !GLOBAL.modelParaContents.isInherit;
        var i, l;
        for (i = 0, l = widgets.length; i < l; i++ ) {
            widgets[i].destroy();
        }
        GLOBAL.modelParaContents.widgets = [];
        if ( editable ) {
            _createModelParaWidgets();
        } else {
            for (i = 0, l = $scope.modelParaList.length; i < l; i++ ) {
                var id;
                if ( $scope.modelParaList[i].isSendEmail ) {
                    id = GLOBAL.view.getGlobalId("modelPara_email_" + $scope.modelParaList[i].name);
                    $('#' + id).html($scope.modelParaList[i].value);
                } else {
                    id = GLOBAL.view.getGlobalId("modelPara_" + $scope.modelParaList[i].name);
                    $('#' + id).html($scope.modelParaList[i].value);
                }
            }
        }
    }

    function _isModelParaChange (cField, value) {
        if ( value instanceof Date ) {
            if ( GLOBAL.modelParaContents[cField].oldContent.value - value === 0 )  {
                return false;
            }
        } else if ( value instanceof Object ) {
            for ( var i in value ) {
                if ( value[i] !== GLOBAL.modelParaContents[cField].oldContent.value[i] ) {
                    break;
                }
            }
            if ( value[i] === GLOBAL.modelParaContents[cField].oldContent.value[i] ) return false;
        } else {
            if ( GLOBAL.modelParaContents[cField].oldContent.value === value ) {
                return false;
            }
        }

        return true;
    }
}]);
