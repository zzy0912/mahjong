angular.module("cue").controller('model_org_enum', [
    "$scope",
    "$compile",
    "$q",
    "$http",
    "$element",
    "arrayUtil",
    "pageService",
    "ajaxService",
    "defService",
    "enumService",
    "defTree",
    function ($scope, $compile, $q, $http, $ele, arrayUtil, pageService, ajaxService, defService, enumService, defTree) {
        pageService.registerController("model_org_enum", $scope, $ele);
        // 用来存放控制器中所使用的全局变量
        var GLOBAL = {
            isItemLoaded: false,
            isEditEnumitem: false,
            enumItemMap: {},
            enumGrid: undefined,
            selectedEnum: undefined,
            enumListWidget: undefined,
            view: pageService.getViewByNode($ele[0])
        };

        GLOBAL.org = GLOBAL.view.viewObj;
        $scope.initReady = $q.defer();

        GLOBAL.view.widgetReady.then(function () {
            var tabs_id = GLOBAL.view.getGlobalId("orgTabWidget");
    	 	var tabs_node = document.getElementById(tabs_id);
            var init_func = function (tab) {
                if (tab.label === "枚举" && !GLOBAL.isItemLoaded) {
                    // 获取各个表格控件
                    GLOBAL.enumGrid = GLOBAL.view.getWidgetByLocalId('enumGrid').object;
                    GLOBAL.isItemLoaded = true;

                    var searchInputBoxId = GLOBAL.view.getGlobalId("searchEnumValue");
                    GLOBAL.searchInputBox = document.getElementById(searchInputBoxId);

                    $("#" + searchInputBoxId).bind("keypress",function(a) {
                        "13" == a.keyCode && $scope.searchModel();
                    });

                    var iNode = document.getElementById(GLOBAL.view.getGlobalId("searchIEnum"));
                    iNode.onmouseover = function () {
                        iNode.style.color = "#5eaee3";
                    }
                    iNode.onmouseout = function () {
                        iNode.style.color = "#000";
                    };
                    // 初始化工作项视图信息
                    initWorkItemInfo();

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
            for (; i < l; i++) {
                if ($scope.models[i].name === selectName.name) {
                    $scope.selectedModel = $scope.models[i];
                    break;
                }
            }
            refreshWorkItemView();
        };

        function initWorkItemInfo() {
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

            $scope.models.sort(_compareModel("label"));
            GLOBAL.models = angular.copy($scope.models);

            if (!$scope.selectedModel)
                $scope.selectedModel = $scope.models instanceof Array ? $scope.models[0] : undefined;

            // 初始化存放枚举列表的控件
            enumWidgetReady = _createEnumsWidget($scope.enums);
            // 初始化存放枚举描述的控件

            enumWidgetReady.then(function () {
                refreshWorkItemView(false);
            });
        }

        function _compareModel(property) {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];
                return value1.localeCompare(value2);
            }
        }
    $scope.myKeyup = function(e){
        var keycode = window.event?e.keyCode:e.which;
        if(keycode==13){
            $scope.searchModel();
        }
    };

        $scope.searchModel = function () {
            var searchItem = GLOBAL.searchInputBox.value;
            var result = [];
            for (var i = 0; i < GLOBAL.models.length; i++) {
                if (GLOBAL.models[i].label.indexOf(searchItem) >= 0)
                    result.push(GLOBAL.models[i]);
            }
            $scope.models = result;
            if ($scope.models.length > 0) {
                $scope.selectedModel = $scope.models[0];
                refreshWorkItemView();
            }
        }

        function refreshWorkItemView(isInit) {
            // 获取被选中的模型的定义
            defService.getTargetDefAsync($scope.selectedModel.name).then(function (def) {
                GLOBAL.enumGrid.change.clear();
                $scope.enums = def.enums;
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

                for (var i = 0, l = $scope.enums.length; i < l; i++) {
                    if ($scope.enums[i].label === GLOBAL.enumListWidget.value) {
                        GLOBAL.selectedEnum = $scope.enums[i];
                        GLOBAL.enumGrid.refreshAxes(null, true);
                    }
                }


                var callPara = {
                    target: "enum",
                    retFields: ["id", "description", "itemModel"],
                    filter: {
                        field: "model",
                        match: "EQ",
                        value: $scope.selectedModel.name
                    },
                    permission: {
                        action: "list",
                        target: "org",
                        id: GLOBAL.org.id
                    },
                    count: -1
                };
                ajaxService.call("model", "getEntities", callPara, "获取枚举数据失败").then(function (result) {
                    for (var i = 0, l = result.list.length; i < l; i++) {
                        for (var j in $scope.enums) {
                            if ($scope.enums[j].itemModel == result.list[i].itemModel) {
                                $scope.enums[j].id = result.list[i].id;
                                $scope.enums[j].description = result.list[i].description;
                                break;
                            }
                        }
                    }
                    if (GLOBAL.selectedEnum) {
                        GLOBAL.enumDescwidget.set("value", GLOBAL.selectedEnum.description);
                    }
                });

                $scope.initReady.resolve();
            });
        }

        /**************枚举部分**************/

        //更改保存按钮
        function _exchangeButton(status) {
            if (!status) {
                $scope.Modified = true;
                $scope.notModify = false;
                $(GLOBAL.permSaveButtonId).attr("disabled", false);
            } else {
                $scope.Modified = false;
                $scope.notModify = true;
                $(GLOBAL.permSaveButtonId).attr("disabled", "disabled");
            }
        }

        function _createNodeByList(list) {
            var nodes = [];

            for (var i = 0, l = list.length; i < l; i++) {
                nodes.push(this.def.createNodeByValue(null, list[i], GLOBAL.selectedEnum.itemModel, true, null, true));
            }
            return nodes;
        }

        $scope.addEnumItem = function (para) {
            var initValue = {
                color: "#000",
                bgColor: "#fff",
                enBg: false,
                defaultFlag: false,
                label: " ",
                name: "",
                description: "",
                enum: {id: GLOBAL.selectedEnum.id}
            }
            var option = {initValue: initValue};
            para.widget.action.create(null, GLOBAL.selectedEnum.itemModel, true, option);
            GLOBAL.isEditEnumitem = true;
            GLOBAL.enumGrid.refreshAxisY();
            GLOBAL.isEditEnumitem = true;

        };

        $scope.refreshBtnDisabled = function (para) {
            var node = para.node;
            var widget_info = para.widgetInfo;
            if (node.value.buildIn) {
                widget_info.widget.set("disabled", true);
            } else if (!node.value.buildIn) {
                widget_info.widget.set("disabled", false);
            }
        };

        $scope.deleteEnumItem = function (para) {
            if (para.selectedNodes && para.selectedNodes.length > 0)
                para.widget.action.delete(para.selectedNodes[0]);
            GLOBAL.isEditEnumitem = true;
        }

        $scope.createEnumGridAxisYCustomQuery = function (para) {
            var deferY = $q.defer(), enumItems, list, call_para, method;
            // 修改axisY.def的Node
            para.def.nodes[0].subnodes[0].filterTarget = GLOBAL.selectedEnum.itemModel;
            para.def.nodes[0].subnodes[0].type = GLOBAL.selectedEnum.itemModel;
            para.def.nodes[1].type = GLOBAL.selectedEnum.itemModel;
            if (GLOBAL.selectedEnum.isTree) {
                para.widget.isTreeGrid = true;
                var subnodes = [defService.loadDef({
                    type: GLOBAL.selectedEnum.itemModel
                }, defTree.Subnode)];
                para.def.nodes[1].subnodes = subnodes;
                method = "getEntityTree";
                call_para = {
                    nodes: [{
                        subnodes: [{
                            type: GLOBAL.selectedEnum.itemModel,
                            filter: {field: "parent", match: "EQ", value: null}
                        }]
                    }, {
                        type: GLOBAL.selectedEnum.itemModel,
                        retFields: ["name", "defaultFlag", "color", "bgColor", "enBg", "description", "sortId"],
                        subnodes: [{
                            type: GLOBAL.selectedEnum.itemModel,
                            filter: {field: "parent", match: "EQ", value: "$parentId"}
                        }]
                    }]
                };
            } else {
                var gride = GLOBAL.enumGrid;
                gride.toolbarDef.actionConfigColumn = false;
                para.widget.isTreeGrid = false;
                para.def.nodes[1].subnodes = undefined;
                method = "getEntities";
                call_para = {
                    target: GLOBAL.selectedEnum.itemModel,
                    retFields: ["name", "defaultFlag", "color", "bgColor", "enBg", "description", "sortId"],
                    permission: {
                        action: "list",
                        target: "org",
                        id: GLOBAL.org.id
                    },
                    count: -1
                };
            }
            ajaxService.call("model", method, call_para, "获取枚举数据失败").then(function (result) {
                list = _createNodeByList.call(para, result.list);
                GLOBAL.enumItemMap[GLOBAL.selectedEnum.itemModel] = angular.copy(result.list);

                deferY.resolve({totalCount: list.length, list: list});
            });

            // 需要提前异步获取指定对象的定义,以便QueryGrid能够用同步获取定义
            defService.getTargetDefAsync(GLOBAL.selectedEnum.itemModel);
            GLOBAL.isEditEnumitem = false;

            return deferY.promise;
        };

        $scope.createEnumGridAxisXCustomQuery = function (para) {
            var deferX = $q.defer(), list;
            var axisx_def = para.def;
            var widget = para.widget;
            $scope.initReady.promise.then(function () {
                defService.getTargetDefAsync(GLOBAL.selectedEnum && GLOBAL.selectedEnum.itemModel).then(function (def) {
                    if (!def)
                        return;
                    axisx_def.useModels = [def.name];
                    widget.treeColumnId = null;
                    //工具栏按钮显示控制
                    if(def.editable == "false"){
                        require(["dojo/dom-style"], function (domStyle) {
                            for (var key in GLOBAL.enumGrid.toolbar._widgetInfoMap) {
                                if(key != "refresh"){
                                    var widget = GLOBAL.enumGrid.toolbar._widgetInfoMap[key].widget;
                                    domStyle.set(widget.domNode, "display", "none");
                                }
                            }
                        })
                    }else {
                        require(["dojo/dom-style"], function (domStyle) {
                            for (var key in GLOBAL.enumGrid.toolbar._widgetInfoMap) {
                                if(key != "refresh"){
                                    var widget = GLOBAL.enumGrid.toolbar._widgetInfoMap[key].widget;
                                    domStyle.set(widget.domNode, "display", "inline");
                                }
                            }
                        })
                    }
                    if(!GLOBAL.selectedEnum.isTree){
                        require(["dojo/dom-style"], function (domStyle) {
                            var widget = GLOBAL.enumGrid.toolbar._widgetInfoMap.createSubnodeInside.widget;
                            domStyle.set(widget.domNode, "display", "none");
                        })
                    }
                    // 创建子节点
                    var env_var_map = widget ? widget.getEnvVarMap() : null;
                    var nodes = axisx_def.createNodeChildren(null, env_var_map);

                    // 重写部分字段的decorator、formatter
                    for (var i = 0, l = nodes.length; i < l; i++) {
                        if (nodes[i].type === ".color" || nodes[i].type === ".bgColor") {
                            nodes[i].nodeDef.decorator = function (cellData, grid, rowId, col) {
                                // 列节点
                                var node_x = col.node;
                                // 行节点
                                var node_y = grid.getNodeYByRowId(rowId);
                                // cell的内容
                                var cellValue = node_y.value[node_x.nodeDef.field] || "";
                                if (node_x.type === ".color" && cellValue == "")
                                    cellValue = "#000";
                                if (node_x.type === ".bgColor" && cellValue == "")
                                    cellValue = "#fff";
                                return '<div style="display: inline-block; border: 1px solid black; ' +
                                    'width: 20px; height: 20px; background-color: ' + cellValue + '"></div>' + cellValue;
                            };
                            nodes[i].nodeDef.editor = "dijit/ColorPalette";
                            nodes[i].nodeDef.width = 100;
                        } else if (nodes[i].type === ".label") {
                            nodes[i].nodeDef.decorator = function (cellData, grid, rowId, col) {
                                // 列节点
                                var node_x = col.node;
                                // 行节点
                                var node_y = grid.getNodeYByRowId(rowId);
                                // cell的内容
                                var rowValue = node_y.value;
                                var ret = "<div style='width: 100%; height: 25px; line-height: 25px; ";
                                if (rowValue.color)
                                    ret += "color: " + rowValue.color + "; ";
                                if (rowValue.enBg && rowValue.bgColor)
                                    ret += "background-color: " + rowValue.bgColor + "; ";
                                ret += "' >" + (rowValue.label ? rowValue.label : '') + "</div>";
                                return ret;
                            };
                            nodes[i].nodeDef.formatter = function (rowNode) {
                                return rowNode.value;
                            };
                            nodes[i].nodeDef.width = 80;
                        } else if (nodes[i].type === ".name") {
                            nodes[i].nodeDef.width = 100;
                        } else if (nodes[i].type === ".description") {
                            nodes[i].nodeDef.width = 200;
                        } else {
                            nodes[i].nodeDef.width = 80;
                        }
                        if (def.editable == "false") {
                            nodes[i].nodeDef.editable = false;
                        } else {
                            nodes[i].nodeDef.editable = true;
                        }
                    }
                    deferX.resolve({totalCount: nodes.length, list: nodes});
                });
            });
            return deferX.promise;
        };

        function _createEnumsWidget(data) {
            var widgetId = GLOBAL.view.getGlobalId("enumList"), enumWidgetReady = $q.defer();
            var desWidgetId = GLOBAL.view.getGlobalId("enumDescription");

            require(["fusion/ui/input/ComboBox", "fusion/ui/input/TextArea", "dojo/store/Memory"], function (ComboBox, TextArea, Memory) {

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

                GLOBAL.enumDescwidget = GLOBAL.view.getWidgetByLocalId('enumDescription').object;

                enumWidgetReady.resolve();
            });

            return enumWidgetReady.promise;
        }

        $scope.save = function (para) {
            var calls = GLOBAL.enumGrid.change.getSubmitCalls();
            for(var i in calls){
               if(calls[i].method !="deleteEntity" && calls[i].para.entity.parent && calls[i].para.entity.parent.id){
                   calls[i].para.entity.parent = calls[i].para.entity.parent.id;
               }
            }
            if (GLOBAL.enumChangeDescription != undefined) {
                var entity = {
                    id: GLOBAL.selectedEnum.id,
                    description: GLOBAL.enumChangeDescription
                }
                GLOBAL.selectedEnum.description = GLOBAL.enumChangeDescription;
                var permission = {
                    action: "list",
                    target: "org",
                    id: GLOBAL.org.id
                };
                var call = ajaxService.createCall("model", "updateEntity", "target", "enum", "entity", entity, "permission", permission);
                calls.push(call);
            }
            var allCall = [];
            if(calls.length>0){
                var para = {
                    target: calls[0].para.target,
                    list:[],
                    extItems: []
                };
                for(var i in calls){
                    if(calls[i].method == "updateEntity"){
                        para.list.push(calls[i].para.entity);
                    }else {
                        allCall.push(calls[i]);
                    }
                }
                if(para.list.length>0){
                    allCall.push({method:"updateEntityList",para:para,service:"model"});
                }
            }
            ajaxService.batchCall(allCall, "保存权限失败").then(function () {
                angular.cue.get("angularUtil").showInfoMessage("已保存" + calls.length + "个修改");
                for (var item in GLOBAL.enumGrid.change.change._editedItems) {
                    var key = GLOBAL.enumGrid.change.change._editedItems[item].type;
                    var changeValue = GLOBAL.enumGrid.change.change._editedItems[item].value;
                    for (var pos in GLOBAL.enumItemMap[key]) {
                        if (GLOBAL.enumItemMap[key][pos].id == changeValue.id)
                            GLOBAL.enumItemMap[key][pos] = changeValue;
                    }
                }
                for (var item in GLOBAL.enumGrid.change.change._addedItems) {
                    var key = GLOBAL.enumGrid.change.change._addedItems[item].type;
                    var addValue = GLOBAL.enumGrid.change.change._addedItems[item].value;
                    GLOBAL.enumItemMap[key].push(addValue);
                }
                GLOBAL.enumGrid.change.clear();
                GLOBAL.enumGrid.refreshAxisY();
            });
        }

        $ele.on("userInput", function (event) {
            var widgetMap = GLOBAL.view.widgetMap;
            require(["dijit/registry", "fusion/ui/input/TextArea"], function (registry, TextArea) {
                var widget = registry.byNode(event.target);
                if (event.target === GLOBAL.enumListWidget.domNode) {
                    for (var i = 0, l = $scope.enums.length; i < l; i++) {
                        if (!$scope.enums[i].label) {
                            throw(new Error("枚举项未定义label"));
                        }

                        if ($scope.enums[i].label === GLOBAL.enumListWidget.value) {
                            GLOBAL.selectedEnum = $scope.enums[i];
                            GLOBAL.enumDescwidget.set("value", GLOBAL.selectedEnum.description);
                            //GLOBAL.enumGrid.action.refresh()
                            GLOBAL.enumGrid.change.clear();
                            GLOBAL.enumGrid.refreshAxes(null, true);
                        }
                    }
                }
                if (event.target === GLOBAL.enumDescwidget.domNode) {
                    GLOBAL.enumChangeDescription = event.target.value;
                }
            });
        });
    }]);
