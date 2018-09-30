/**
 * Created by MyPC on 2017/6/13.
 */

import stringUtil from './util/stringUtil';
import objectUtil from './util/objectUtil';
import domUtil from './util/domUtil';
import dateUtil from './util/dateUtil';
import locationUtil from './util/locationUtil';
import cacheService from './core/cacheService';
import dataService from './core/dataService';
import remoteService from './core/remoteService';
import uiService from './core/uiService';
import enumService from './core/enumService';
import miscService from './core/miscService';
import envService from './core/envService';
import queryService from './core/queryService';
import globalProperties from './core/globalProperties';
import EntityBox from './ui/item/EntityBox';
import QUploader from './ui/item/QUploader';
import QFormItem from './ui/form/FormItem';

export default {
    install: function(Vue) {
        Vue.cue = this;
        Vue.prototype.$cue = this;
        // 注册全局组件
        Vue.component(EntityBox.name, EntityBox);
        Vue.component(QUploader.name, QUploader);
        Vue.component(QFormItem.name, QFormItem);
    },
    stringUtil,
    objectUtil,
    domUtil,
    dateUtil,
    locationUtil,
    cacheService,
    dataService,
    remoteService,
    uiService,
    enumService,
    miscService,
    envService,
    globalProperties,
    queryService
};
