angular.module("cue").controller("index_user", [
  "$scope",
  "$element",
  "pageService",
  "ajaxService",
  function ($scope, $ele, pageService, ajaxService) {
    pageService.registerController("index_user", $scope, $ele);

    $scope.qLogout = function () {
      // 清除cookie中的token
      $.cookie("token", null, {path: "/", expires: 0});
      // 跳转到登陆页面
      window.location = "/public/login.html";
    };

    $scope.userShow = false;

    $scope.show = function () {
      $scope.userShow = true;
    };
    $scope.hide = function () {
      $scope.userShow = false;
      $scope.color1 = "#eff";
      $scope.color2 = "#eff";
      $scope.color3 = "#eff";
    };
    $scope.changeColor1 = function () {
      $scope.color1 = "#c7e4f6";
      $scope.color2 = "#eff";
      $scope.color3 = "#eff";
    };
    $scope.changeColor2 = function () {
      $scope.color1 = "#eff";
      $scope.color2 = "#c7e4f6";
      $scope.color3 = "#eff";
    };
    $scope.changeColor3 = function () {
      $scope.color1 = "#eff";
      $scope.color2 = "#eff";
      $scope.color3 = "#c7e4f6";
    };

    $scope.userInfoSet = function () {
      var ItemDialog = angular.fusion.ItemDialog;
      //var MessageDialog = angular.fusion.MessageDialog;
      var userId = pageService.getOpUser().id;
      var viewObj = {
        id: userId,
        type: "item",
        target: "user",
        view: "editInfo",
        item: {},
        isPopup: true
      };
      var dialog = new ItemDialog({title: "Modify", viewObj: viewObj, style: "width: 800px; height: 800px"});
      dialog.closeHandler = function (btn, content) {
        if (btn === 0) {
          var para = {target: "user", entity:{}};
          for(var key in content)
              para.entity[key] = content[key];
		    
          ajaxService.call("model", "updateEntity", para, "Failed").then(function (result) {
              angular.cue.get("angularUtil").showInfoMessage("Success");
            });
        }
      };
      dialog.show();
    };

    $scope.modifyPsw = function (para) {
      var ItemDialog = angular.fusion.ItemDialog;
      //var MessageDialog = angular.fusion.MessageDialog;
      var userId = pageService.getOpUser().id;
      var viewObj = {
        id: userId,
        type: "item",
        target: "user",
        view: "changePassword",
        item: {},
        isPopup: true
      };
      var dialog = new ItemDialog({title: "Change password", viewObj: viewObj, style: "width: 400px; height: 200px"});
      dialog.closeHandler = function (btn, content) {
        if (!btn) {
          var err;
          if (!content.newPassword1)
            err = "New password can not be empty";
          else if (content.newPassword1 !== content.newPassword2)
            err = "Two passwords not equal";
          else if (content.oldPassword == content.newPassword2)
            err = "New password is same with old password";

          if (err) {
            angular.cue.get("angularUtil").showErrorMessage(err);
            return false;
          } else {
            var para = ajaxService.createPara("id", userId, "oldPassword",
              content.oldPassword, "newPassword", content.newPassword1)
            ajaxService.call("user", "updatePassword", para, "Change password failed").then(function (result) {
              angular.cue.get("angularUtil").showInfoMessage("Change password successful");
            });
            return true;
          }
        }
      };
      dialog.show();
    };
  }]);

angular.module("cue").controller("index_sideBar", ["$scope","$element","pageService","ajaxService", function ($scope, $ele, pageService, ajaxService) {
  pageService.registerController("index_sideBar", $scope, $ele);

  var GLOBAL = {
    isSmall : false,
    logobig: {path: "public/images/logo-1.png"},
    logosmall: {path: "public/images/logo-2.png"}
  }

  init();

  function init(){
    var call_para = { target: "org", filter: { field: "type", match:"EQ", value: "company" },
            retFields: [ "logo","logoShrink" ] };

    ajaxService.call("model", "getEntity", call_para).then(function (result) {
        //GLOBAL.org = result;
       
        if(result.logo){ 
          var logolist = JSON.parse(result.logo);
          GLOBAL.logobig.path = "rest/upload/mime?path=" + logolist[0].path;
          var logo = $("#logoPart img");
          logo.attr("src",GLOBAL.logobig.path);
          logo.css({"height":"34px","width":"100px"});
        }
        if(result.logoShrink){
          var logoshrinklist = JSON.parse(result.logoShrink);
          GLOBAL.logosmall.path = "rest/upload/mime?path=" + logoshrinklist[0].path;
        }
        //$scope.dataReady.resolve();
    });
  };

  $scope.shrinkDownMenu = function(){
    if(!GLOBAL.isSmall) {
      $("#sideBar").addClass("menuBarSmall");
      var path = GLOBAL.logosmall.path;
      var logo = $("#logoPart img");
      logo.attr("src",path);
      //logo.css({"height":"34px","clip": "rect(0px 34px 34px 0px)"});
      logo.css({"height":"34px","width":"34px"});
      $("#logoPart").addClass("smallLogo");
      $("#sideBar .dijitMenuItem").attr("title",function(i,origValue){
        var thisdom = this;
        var children = $(thisdom).children(".dijitMenuItemLabel")[0];
        var title = $(children).text();
        return title; 
      });
      GLOBAL.isSmall = true;
      $scope.layout();
    }
    else{
      $("#sideBar").removeClass("menuBarSmall");
      var path = GLOBAL.logobig.path;
      var logo = $("#logoPart img");
      logo.attr("src",path);
      logo.css({"height":"34px","width":"100px"});
      $("#logoPart").removeClass("smallLogo");
      $("#sideBar .dijitMenuItem").attr("title",function(i,origValue){
        return ""; 
      });
      GLOBAL.isSmall = false;
      $scope.layout();
    }
  };

}]);
