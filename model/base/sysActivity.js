angular.module('cue').controller('model_activity', [ '$scope', '$element', 'pageService', 'ajaxService', 'defService','$filter', '$q', function ($scope, $ele, pageService, ajaxService, defService, $filter, $q) {
    GLOBAL = { 
        pageSize: 20, 
        //初始化filter
        filter: { relation: "AND" , children: [{ field: 'id', match: 'NE', value: null }]},
        belongOrgId: null
    };

	$scope.view = pageService.getViewByNode($ele[0]);
    pageService.registerController('model_activity', $scope, $ele);

    //加载当前视图对象的所有控件
    $scope.qView.widgetReady.then(function () {
        var widgetMap = $scope.qView.widgetMap;
        
        var sys_def = defService.getSystemDef();
        $scope.models = [{ name: "all", label: "所有" }];
        // 获取logActivity为true的模型列表
        for (var i = 0, len = sys_def.models.length; i < len; i++) {
            if (sys_def.models[i].logActivity) {
                var model = sys_def.models[i];
                if (model.name === "wfHistoryStep" || model.name === "wfCurrentStep" || model.name === "wfEntry" || model.name === "todoInfo") {
                    //去除该模型
                }else{
                    model.id = i;
                    $scope.models.push(model);
                }  
            }
        }

        //活动记录的场景类型
        if ($scope.view.viewObj.module === "workbench") {
            //进入个人工作台 我的活动
            GLOBAL.filter.children.push({ field: 'creator', match: 'EQ', value: $scope.qUser.id });
            GLOBAL.belongOrgId = $scope.view.viewObj.org.id;
        }else if($scope.view.viewObj.target === "org") {
            //进入公司下的 系统设置 选择 导航树 上的组织
            GLOBAL.belongOrgId = $scope.view.viewObj.id;
        }else if($scope.view.viewObj.type === "model") {
            //进入组织、或是公司下的模块中的模型
            var curModel = $scope.view.viewObj.model;
            GLOBAL.belongOrgId = $scope.view.viewObj.org.id;
            GLOBAL.filter.children.push({field:'workItem_model', match:'EQ', value:curModel});
        }
        
        angular.forEach(widgetMap, function (widget, key) {
            if (widget.object && widget.object.name === "paginator") {
                // 初始化pageSize
                widget.object.setPageSize(GLOBAL.pageSize);
                GLOBAL.paginationWidget = widget.object;
                ajaxQueryDate(0, true);
            }else if (widget.object && widget.object.name === "filterModels") {
                //初始化模型列表
                require(["dojo/store/Memory"], function (Memory) {
                    widget.object.set("store", new Memory({ data: $scope.models }));
                })
            }
        });
    });

    function _createKeyForDate (date) {
    	return '' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    function _formatDate (date) {
    	var hour = date.getHours(), str;
    	if (hour < 6) 
    		str = '凌晨';
    	else if (hour >= 6 && hour <= 12) 
    		str = '上午';
    	else if (hour > 12 && hour <= 18)
    		str ='下午';
    	else
    		str = '晚上';
    	return str + $filter('date')(date, 'h:mm');
    }

    //清空传入改变字段老的filter
    function _clearOldFilterByField (field) {
        var filter_children = angular.copy(GLOBAL.filter.children);
        var temp_filter = [{ field: 'id', match: 'NE', value: null }];
        for (var i = 0, l = filter_children.length; i < l; i++) {
            //匹配发生改变的字段
            if (filter_children[i].field === field) {
                //移除改变字段的老filter
                //GLOBAL.filter.children.splice(i, 1);
            }else if (i > 0){
                temp_filter.push({ field:filter_children[i].field, match:filter_children[i].match, value:filter_children[i].value});
            }
        }
        GLOBAL.filter.children = temp_filter;
    }

    // 监听日期过滤器发出的事件
    $ele.on('dateChange', function (event) {
        var value = event.value;
        var sDate = value[0], eDate = value[1];
        _clearOldFilterByField('createTime');
        if (sDate) {
            GLOBAL.filter.children.push({ field: 'createTime', match: 'GE', value: sDate })
        }
        if (eDate) {
            GLOBAL.filter.children.push({ field: 'createTime', match: 'LE', value: eDate })
        }
        // 更新数据
        ajaxQueryDate(0, true);
        event.stopPropagation();
    });

    // 监听模型过滤器发出的事件
    $ele.on('modelChange', function (event) {
        var model = event.value;
        _clearOldFilterByField('workItem_model');
        if (model && model !== "all") {
            GLOBAL.filter.children.push({ field: 'workItem_model', match: 'EQ', value: model });
        }
        ajaxQueryDate(0, true);
        event.stopPropagation();
    });

    // 监听组织过滤器发出的事件
    $ele.on('orgChange', function (event) {
        var org = event.value;
        //_clearOldFilterByField('org');
        //安全校验，控件中直接删除组织导致组织为空
        if (org) {
            GLOBAL.belongOrgId = org.id;
        }else {
            //在组织筛选中直接将已选组织清空，此时查询的是 公司下+filter 的活动记录
            if ($scope.view.viewObj.module === "workbench") {
                GLOBAL.belongOrgId = $scope.view.viewObj.org.id;
            }else {
                GLOBAL.belongOrgId = $scope.view.viewObj.id;
            }
        }
        ajaxQueryDate(0, true);
        event.stopPropagation();
    });
    //监听用户过滤器发出的事件
    $ele.on('userChange', function (event) {
        var user = event.value;
        _clearOldFilterByField('creator');
        //用户过滤为空则获取所有用户的活动记录
        if (user) {
            GLOBAL.filter.children.push({ field: 'creator', match: 'EQ', value: user.id });
        }
        ajaxQueryDate(0, true);
        event.stopPropagation();
    });

    //刷新活动记录
    $scope.qRefreshHistory = function(){
        ajaxQueryDate(0, true);
    }

    function ajaxQueryDate (start, isInitPaginationInfo) {
        var callPara = {
            target: 'sysActivity',
            filter: GLOBAL.filter,
            retFields: ['createTime'],
            start: start,
            count: GLOBAL.pageSize,
            order: 'desc',
            orderBy: 'id',
            //传入所查询组织的list-in权限，后台判断当前登录用户是否具备该权限
            permission: { target: "org", id: GLOBAL.belongOrgId, action: "list-in" }
        };

        ajaxService.call('sysActivity', 'getEntities', callPara, '获取活动数据失败').then(function (result) {
            var temporaryDataMap = {};
            $scope.chunks = [];
            if (result.list.length) {
                for (var i = 0, l = result.list.length; i < l; i++) {
                    var date = result.list[i].createTime;
                    var activities = { message: result.list[i].$activity_record, date: date};
                    var date_key = _createKeyForDate(date);

                    temporaryDataMap[date_key] = temporaryDataMap[date_key] || [];
                    temporaryDataMap[date_key].push(activities);
                }

                angular.forEach(temporaryDataMap, function (activities, key) {
                    var specialDate;
                    // 排序(按照时间从大到小)
                    activities.sort(function (value1, value2) {
                        return value2.date - value1.date;
                    });
                    if (key === _createKeyForDate(new Date())) {
                        specialDate = "Today";
                    }
                    $scope.chunks.push({ activities: activities, date: new Date(key), specialDate: specialDate });
                });

                // chunks 排序(按照时间从大到小)
                $scope.chunks.sort(function (value1, value2) {
                    return value2.date - value1.date;
                });

                // 初始化paginator
                if (isInitPaginationInfo) {
                    GLOBAL.paginationWidget.setToltalCount(result.totalCount);
                    GLOBAL.paginationWidget.refresh();
                    GLOBAL.paginationWidget.onPageReady = function () {
                        var start = this.getStartPosition();
                        ajaxQueryDate(start);
                    }
                }
            } else {
                $scope.chunks = [];
                // 初始化paginator
                if (isInitPaginationInfo) {
                    GLOBAL.paginationWidget.setToltalCount(result.totalCount);
                    GLOBAL.paginationWidget.refresh();
                    GLOBAL.paginationWidget.onPageReady = function () {
                        var start = this.getStartPosition();
                        ajaxQueryDate(start);
                    }
                }
            }
        });
    }
}]);