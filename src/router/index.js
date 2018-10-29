import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import Login from '@/view/login';
import Home from '@/view/home';
import Show from '@/view/home/show';
import Org from '@/view/home/org';
import OrgItem from '@/view/home/orgItem';
import User from '@/view/home/user';
import AppUser from '@/view/home/appUser';
import AppUserItem from '@/view/home/appUserItem';
import Locker from '@/view/home/locker';
import Game from '@/view/home/game';
import Machine from '@/view/home/machine';

Vue.use(Router);

export default new Router({
  routes: [
	{
      path: '/home',
      component: Home,
      children:[{
        path: '/',
        name: 'show',
        meta: { title: '首页' },
        component: Show,
      }, {
        path: '/org',
        name: 'org',
        component: Org,
        meta: { title: '组织管理' }
      }, {
        path: '/org/:id',
        name: 'orgItem',
        component: OrgItem
      }, {
        path: '/locker',
        name: 'locker',
        component: Locker
      }, {
        path: '/game',
        name: 'game',
        component: Game
      }, {
        path: '/machine',
        name: 'machine',
        component: Machine
      }, {
        path: '/user',
        name: 'user',
        component: User
      }, {
        path: '/appUser',
        name: 'appUser',
        component: AppUser
      }, {
        path: '/appUser/:id',
        name: 'appUserItem',
        component: AppUserItem
      }]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
});
