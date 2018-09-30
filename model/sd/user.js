angular.module("cue").controller('userMainResetPassword', [ "$scope", "$element", "ajaxService", "pageService", "dataService", "angularUtil", function ($scope, $ele, ajaxService, pageService, dataService, angularUtil) {

    pageService.registerController("userMain", $scope, $ele);
   
    $scope.isAble = true;
    var GLOBAL = {
        view: pageService.getViewByNode($ele[0]),
        isValid: true,
        userGrid: undefined,
        isItemLoaded: false
    };

    GLOBAL.org = GLOBAL.view.viewObj;

    GLOBAL.view.widgetReady.then(function () {
    	 var tabs_id = GLOBAL.view.getGlobalId("orgTabWidget");
    	 var tabs_node = document.getElementById(tabs_id);
    	 pageService.on("tabChanged", tabs_node, tabs_node, function(event) {
    	 	if (event.newTab.label === "用户" && !GLOBAL.isItemLoaded) {
                // 获取各个表格控件
                GLOBAL.ableUserGrid = GLOBAL.view.getWidgetByLocalId('ableUserGrid').object;
                GLOBAL.disableUserGrid = GLOBAL.view.getWidgetByLocalId('disableUserGrid').object;
                // GLOBAL.isItemLoaded = true;
                // // 初始化工作项视图信息
                // GLOBAL.isValid = true;
                angularUtil.safeApply($scope, function() {
                	$scope.isAble = true;
                	$scope.isDisable = false;
		   });
            }
    	 });
    });

    $scope.resetPassword = function(para) {
        var selected_nodes = para.selectedNodes;
        if(selected_nodes.length == 0) {
            angular.cue.get("angularUtil").showErrorMessage("Please select users");
            return;
        };

        var ItemDialog = angular.fusion.ItemDialog;
        var MessageDialog = angular.fusion.MessageDialog;  
        var viewObj = {
            id: -1,
            type: "item",
            target: "user",
            view: "resetPassword",
            item: {},
            isPopup: true
        };
        var dialog = new ItemDialog({title: "Modify password", viewObj: viewObj, style: "width: 400px; height: 200px" });
        dialog.closeHandler = function (btn, content) {
            if (!btn) {                
                 var err;
                if (!content.newPassword1)
                    err = "New password can not empty";
                else if (content.newPassword1 !== content.newPassword2)
                    err = "Two password not equal";

                if(err) {
                    angular.cue.get("angularUtil").showErrorMessage(err);
                    return false;
                } else {                    
                    var calls = [];
                    selected_nodes.forEach(function(node, index){
                        var call = {
                            service:"user",
                            method:"updatePassword",
                            para:{
                                "id":node.value.id,
                                "oldPassword": null,
                                "newPassword": content.newPassword1
                            }
                        }
                        calls.push(call);                       
                    });

                    if(calls.length > 0) {
                        ajaxService.batchCall(calls, "", true).then(function(result){
                            angular.cue.get("angularUtil").showInfoMessage("Reset password for "+calls.length+" users");
                        },function(result){
                            angularUtil.showErrorMessage(result || "Reset password failed");
                        });
                    } 
                    return true;
                }
            }
        };
        dialog.show();
    };

    $scope.disableUser = function(para){
        var selected_nodes = para.selectedNodes;
        if(selected_nodes.length == 0) {
            angular.cue.get("angularUtil").showErrorMessage("Please select users");
            return;
        };
        var calls = [];
        selected_nodes.forEach(function(node, index){
            var call = {
                service: "model",
                method: "updateEntity",
                para:{
                    target: "user",
                    entity: {id: node.value.id ,org: GLOBAL.org, isValid: false }
                }
            }
            //删除角色管理中所有该用户的信息
            calls.push(call);                       
        });

        if(calls.length > 0) {
            ajaxService.batchCall(calls).then(function(result){
                GLOBAL.ableUserGrid.refreshAxisY();
                //GLOBAL.disableUserGrid.refreshAxisY();
                angular.cue.get("angularUtil").showInfoMessage("Disabled "+calls.length+" users");
                
            });
        } 
    };

    $scope.recoveryUser = function(para){
        var selected_nodes = para.selectedNodes;
        if(selected_nodes.length == 0) {
            angular.cue.get("angularUtil").showErrorMessage("Please select users");
            return;
        };
        var calls = [];
        selected_nodes.forEach(function(node, index){
            var call = {
                service: "model",
                method: "updateEntity",
                para:{
                    target: "user",
                    entity: {id: node.value.id ,org: GLOBAL.org, isValid: true }
                }
            }
            calls.push(call);                       
        });

        if(calls.length > 0) {
            ajaxService.batchCall(calls).then(function(result){
                //GLOBAL.ableUserGrid.refreshAxisY();
                GLOBAL.disableUserGrid.refreshAxisY();
                angular.cue.get("angularUtil").showInfoMessage("Enabled "+calls.length+" users");
                
            });
        } 
    }

    $scope.importUser = function (para) {
        var range = { 
          target: "user",
        };
        dataService.import(range, null, null);
    };


    $scope.showAble = function(para){
        $scope.isAble = true;
        $scope.isDisable = false;
        $scope.$apply();
        GLOBAL.ableUserGrid.refreshAxisY();
    }

    $scope.showDisable = function(para){
        $scope.isAble = false;
        $scope.isDisable = true;
        $scope.$apply();
        GLOBAL.disableUserGrid.refreshAxisY();
    }
    
} ]);

