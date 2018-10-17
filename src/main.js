// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
// 引入cue平台
import Cue from './common/cue';
// 引入element-ui模块
import elementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import router from './router';
import VueResource from 'vue-resource';
import VueCookie from 'vue-cookie';
import store from './store';
import filter from './filter';

// 引入样式
import './common/css/common.scss';
import './assets/css/base.css';
import './assets/font/iconfont.css';

//Vue.config.productionTip = false;

/* eslint-disable no-new */
// new Vue({
//  el: '#app',
//  router,
//  components: { App },
//  template: '<App/>'
// })
// 检查浏览器版本。如果IE版本小于9的话，提示问题。
let ie_version = Cue.domUtil.getIEVersion();
if (ie_version > 0 && ie_version < 9.0) {
    document.getElementById('app').innerHTML = '您的IE浏览器版本过低，请使用9.0以上版本的IE浏览器访问！';
} else {
    // 关闭vue在生产环境时生成的提示
    Vue.config.productionTip = false;
    // Vue平台上安装模块
	Vue.use(VueResource);
	Vue.use(VueCookie);
    Vue.use(Cue);
    Vue.use(elementUI);
    let vmConfig = { el: '#app', router, store, filters: filter, render: h => h(App) };

    // 检查是否登录，如果没有登录，跳转到登录界面
    let token = 1; // Vue.cookie.get('token');
    if (token) {
//		window.height = window.innerHeight;
        let vm = new Vue(vmConfig);     // eslint-disable-line
        router.beforeEach((to, from, next) => Cue.uiService.closeDialogByGoBack(vm, next));
    } else {
        window.location = '/login.html#redirect=' + encodeURIComponent(window.location);
    }
}