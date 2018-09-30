angular.module('cue').controller('model_role', ['$scope', '$element', 'ajaxService', 'pageService', 'Widget', 'domUtil', "defModel", function ($scope, $ele, ajaxService, pageService, Widget, domUtil, defModel) {
	var GLOBAL = {};
	$scope.view = pageService.getViewByNode($ele[0]);
	// 设置ItemDialog控件的getContent的类型
	// $scope.view.getDialogContentType = 'direct';
	$scope.isChooseGlobal = true;
	$scope.isShowOrgType = false;
	$scope.isShowOrg = false;

	$scope.onDataReady = function () {
		var scope = this;
			var widgets = scope.qDataList[0].widgets;
			for (var i = 0, l = widgets.length; i < l; i++) {
				if (widgets[i].field === "scopeOrg") {
					var selectDef = new defModel.ViewFieldSelector();
	        		selectDef.addTarget("org");
					GLOBAL.orgEntityWidget = widgets[i].object;
					GLOBAL.orgEntityWidget.setSelectDef(selectDef);
				}
			}
	};

	function userInputListener (event) {
		var widgetMap = $scope.view.widgetMap;

		require(["fusion/ui/input/CheckBox", "fusion/ui/input/EntityTextBox"], function (CheckBox, EntityTextBox) {
			for ( var i in widgetMap ) {
				// 获取定义里面的EntityTextBox控件
				if ( !$scope.dfEntityWidget && widgetMap[i].dojoModule === "fusion/ui/input/EntityTextBox" ) {
					$scope.dfEntityWidget = widgetMap[i];
				}

				if ( widgetMap[i].getDomNode() === event.target ) {
					var method =  widgetMap[i].isUpdateIncrementally() ? "getChange" : "getValue";

					if (  widgetMap[i].hasMethod(method) ) {
						var value =  widgetMap[i].executeMethod(method);

						if ( widgetMap[i].field === "scopeType" ) {
							exeRegionType(value, CheckBox, EntityTextBox);
						} else if ( widgetMap[i].field === "scopeOrgType" && GLOBAL.orgEntityWidget ) {
							var def = GLOBAL.orgEntityWidget.selectDef;
							def.targets[0].field = "type";
							def.targets[0].value = value;
							GLOBAL.orgEntityWidget.setSelectDef(def);
						}		 
					}
				}
			}
		});
	}

	function exeRegionType (value, CheckBox, EntityTextBox) {
		switch (value){
			case 1:
				$scope.isChooseGlobal = true;
				break;
			case 2:
				$scope.isChooseGlobal = false;
				$scope.isShowOrgType = false;
				$scope.isShowOrg = true;
				var item = $scope.view.viewObj ? $scope.view.viewObj.item : null;
				break;
			case 3:
				$scope.isChooseGlobal = false;
				$scope.isShowOrgType = true;
				$scope.isShowOrg = false;
				break;
		}

		$scope.$apply();
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

	$ele.on('userInput', userInputListener);
}]);