import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import Login from '@/view/login';
import Home from '@/view/home';
import Machine from '@/view/machine';

Vue.use(Router);

export default new Router({
  routes: [
	{
      path: '/',
      alias: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/machine',
      name: 'machine',
      component: Machine
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
});
