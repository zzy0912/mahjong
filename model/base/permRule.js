angular.module('cue').controller('permRule', ['$scope', '$element', 'ajaxService', 'pageService', 'Widget', 'domUtil', "defModel","$q", function ($scope, $ele, ajaxService, pageService, Widget, domUtil, defModel, $q) {

	pageService.registerController('permRule', $scope, $ele);
	$scope.view = pageService.getViewByNode($ele[0]);

	GLOBAL = {
		// 获取当前组织
		currentOrg: $scope.view.viewObj.org
	};
	// 获取父scope
	if (pageService.getControllerByName('model_org_perm')) {
		GLOBAL.pScope = pageService.getControllerByName('model_org_perm').scope
	} else {
		GLOBAL.pScope = pageService.getControllerByName('model_folder_perm').scope
	}
	
	GLOBAL.operOrg = GLOBAL.pScope.org;
	
	// 当前选中的模型
	GLOBAL.selectedModel = GLOBAL.pScope.selectedModel;
	// 当前模型可配置的所有所有动作
	GLOBAL.actions = GLOBAL.pScope.permRuleActions;


    $scope.onDataReady = function () {
    	var scope = this;
    		var widgets = scope.qDataList[0].widgets;
    		if (scope.qDataList[0].client.perOwerType) {
    			exeOwerType(scope.qDataList[0].client.perOwerType.id);
    			if (scope.qDataList[0].client.ownerOrgSrc) {
    				exetargetRoleOrgType(scope.qDataList[0].client.ownerOrgSrc.id);
    			}
    		}
	        for (var i = 0, l = widgets.length; i < l; i++) {
	        	if (widgets[i].field === "action") {
	        		widgets[i].object.store.setData(GLOBAL.actions);
	        		// 此时控件的value为name字段，我们需要设置成label字段对应的value
	        		for (var j = 0, len = GLOBAL.actions.length; j < len; j++) {
	        			if (GLOBAL.actions[j].name === scope.qDataList[0].client.action) {
	        				scope.qDataList[0].client.action = GLOBAL.actions[j].label;
	        				break;
	        			}
	        		}
	        	} 
	        }
    };

    //选择角色的定制查询
    $scope.roleQueryY = function(para){
    	var t = para, list = [], defer = $q.defer();
        var grid = para.widget;
        var env_var_map = grid.getEnvVarMap();
        var sub_node_def = para.def.nodes[0].subnodes[0];
        var cqpara = sub_node_def.createQueryPara(env_var_map);
        ajaxService.call("model", "getEntity", {target: "org", id: GLOBAL.selectOrg.id, retFields: ["type"]}, "当前实体获取失败").then(function (result) {
            GLOBAL.selectOrg = result;
            var filter = {
	        	relation: "OR",
	        	children:[
	        	{
	        		field: "scopeOrg",
					match: "EQ",
					value: GLOBAL.selectOrg.id
	        	},
	        	{
	        		field: "scopeType",
	        		match: "EQ",
	        		value: "global"
	        	},
	        	{
	        		field: "scopeOrgType",
	        		match: "EQ",
	        		value: GLOBAL.selectOrg.type
	        	}]
				
	    	};
	        ajaxService.call("model", "getEntities", { target: "role",filter: filter, permission: {action:"list"} }, "表格创建失败").then(function (result) {
	            for (var i = 0, l = result.list.length; i < l; i++) {
	                list.push(t.def.createNodeByValue(null, result.list[i], "phase", false, null, false));
	            }

	            defer.resolve({ totalCount: list.length, list: list });
	        });
        });
        

        return defer.promise;
	}

	// 构造widget	
	function createWidget (globalId, module, ctrLocalId, widgetType, qLocalId, view, object) {
		// 构造widget
		var ele = $('#' + globalId);
		ele.attr({"data-dojo-type": module});

		var qGlobalId = $scope.view.getGlobalId(ctrLocalId);
		var scope_id = domUtil.getUniqueId($('#' + qGlobalId)[0], "qController_");

		var widget = Widget.createFromEle(ele, widgetType, qLocalId, view, scope_id, [] );
		widget.object = object;
		$scope.view.addWidget(widget);

		return widget;
	}

	function userInputListener (event) {
		var widgetMap = $scope.view.widgetMap;

		require(["fusion/ui/input/CheckBox", "fusion/ui/input/EntityTextBox" , "fusion/ui/input/EnumComboBox" ], function (CheckBox, EntityTextBox, EnumComboBox) {
			for ( var i in widgetMap ) {
				// 获取定义里面的EntityTextBox控件
				if ( !$scope.dfEntityWidget && widgetMap[i].dojoModule === "fusion/ui/input/EntityTextBox" ) {
					$scope.dfEntityWidget = widgetMap[i];
				}
				// 获取定义里面的EnumComboBox控件
				if ( !$scope.dfComboWidget && widgetMap[i].dojoModule === "fusion/ui/input/EnumComboBox" ) {
					$scope.dfComboWidget = widgetMap[i];
					var value = ['id', 'name', 'label' ];
					$scope.dfComboWidget.executeMethod('setRetValueType',value);
				}

				if ( widgetMap[i].getDomNode() === event.target ) {
					var method =  widgetMap[i].isUpdateIncrementally() ? "getChange" : "getValue";

					if (  widgetMap[i].hasMethod(method) ) {
						var value =  widgetMap[i].executeMethod(method);

						if ( widgetMap[i].field === "perOwerType" ) {
							exeOwerType(value);
						} else if ( widgetMap[i].field === "ownerOrgSrc") {
							exetargetRoleOrgType(value.name);
						} else if ( widgetMap[i].field === "perOwnRoleOrg" ) {
							// var def = GLOBAL.roleEntityWidget.selectDef;
							// def.targets[0].value = value && value.id || null;
							// GLOBAL.roleEntityWidget.setSelectDef(def);
							GLOBAL.selectOrg = value;
						}
					}
				}
			}
		});
	}

	function exeOwerType (value) {
		switch ( value ) {
			case 1: 
				$scope.isSelectedUserType = false;
				$scope.isSelectedRoleType = true;
				// 如果选择过2, 初始化之前选过的信息
				$scope.qDataList[0].ownerOrgSrc = undefined;
				$scope.qDataList[0].perOwnRole = undefined;
				$scope.qDataList[0].perOwnRoleOrg = undefined;
				break;
			case 2: 
				$scope.isSelectedRoleType = false;
				$scope.isSelectedUserType = true;
				$scope.qDataList[0].perOwnUser = undefined;
				break;
		}
	}

	function exetargetRoleOrgType (value) {
		var scope = $scope.view.getControllerScope('qController');
		$scope.isShowContainAncestorOrg = true;
		switch ( value ) {
			case "opOrg":
				GLOBAL.selectOrg = GLOBAL.currentOrg;
				$scope.isShowRole = true;
				$scope.isShowAllOrg = false;
				break;

			case "specifiedOrg": 
				$scope.isShowAllOrg = true;
				$scope.isShowRole = true;
				break;
			default:
				GLOBAL.selectOrg = GLOBAL.currentOrg;
				$scope.isShowRole = true;
				$scope.isShowAllOrg = false;
				break;
		}
		$scope.$apply();
	}

	$ele.on('userInput', userInputListener);
}]);