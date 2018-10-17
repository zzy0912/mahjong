<style>
    .el-submenu__title i, .el-menu-item i {
        color: #52689F;
        font-size: 19px;
        margin-right: 10px;
    }
    .el-menu-item,.el-submenu__title {
        height: 60px;
        line-height: 60px;
        font-size: 18px;
        padding-left: 30px !important;
        /* color: #52689F; */
    }
    /* .el-menu-item:hover:not(.is-active) {
        border-left: 5px solid #EF7632;
        padding-left: 30px;
        background: rgb(247, 233, 206);
    } */
    .el-menu-item.is-active {
        padding-left: 25px !important;
        border-left: 5px solid #364570;
    }
    /* .el-menu-item {
        color: #52689F;
    }
    .el-menu-item.is-active {
        color: #364570;
    } */
    .el-submenu .el-menu-item {
        padding-left: 64px !important;
        font-size: 16px;
    }
    .el-submenu .el-menu-item.is-active {
        padding-left: 59px !important;
    }
</style>
<template>
	<div :style="`width:${showWidth}px;`" class="left">
        <div class="header">
            <img src="../../assets/logo.png" style="margin:15px 0 0 10px;width:90%;"/>
        </div>
		<el-menu class="thin-scroll" :style="`height:${contentHeight}px;border-right:none;overflow-y:auto;`" text-color="#52689F" active-text-color="#364570" :default-active="currentPage" :collapse=false>
			<el-menu-item index="home" @click="goChild('home')">
				<i class="iconfont icon-home"></i>
				<span slot="title">主页</span> 
			</el-menu-item>
			<el-menu-item index="locker" @click="goChild('locker')">
				<i class="iconfont icon-message"></i>
				<span slot="title">设备管理</span> 
			</el-menu-item>
			<el-menu-item index="machine" @click="goChild('machine')">
				<i class="iconfont icon-message"></i>
				<span slot="title">机器管理</span> 
			</el-menu-item>
			<el-menu-item index="match" @click="goChild('match')">
				<i class="iconfont icon-owner"></i>
				<span slot="title">比赛管理</span> 
			</el-menu-item>
			<el-submenu index="2">
				<template slot="title">
				<i class="iconfont icon-user"></i>
				<span>用户管理</span>
				</template>
				<el-menu-item index="appUser" @click="goChild('appUser')">app用户</el-menu-item>
				<el-menu-item index="user" @click="goChild('user')">系统用户</el-menu-item>
			</el-submenu>
			<el-submenu index="6">
				<template slot="title">
				<i class="iconfont icon-trade"></i>
				<span>交易中心</span>
				</template>
				<el-menu-item index="cashRecord" @click="goChild('cashRecord')">提现管理</el-menu-item>
				<el-menu-item index="transaction" @click="goChild('transaction')">交易记录</el-menu-item>
				<el-menu-item index="order" @click="goChild('order')">充值记录</el-menu-item>
			</el-submenu>
			<el-menu-item index="version" @click="goChild('version')">
				<i class="iconfont icon-upload"></i>
				<span slot="title">版本管理</span>
			</el-menu-item>
			<el-menu-item index="version" @click="goChild('version')">
				<i class="iconfont icon-upload"></i>
				<span slot="title">版本管理</span>
			</el-menu-item>
			<el-menu-item index="version" @click="goChild('version')">
				<i class="iconfont icon-upload"></i>
				<span slot="title">版本管理</span>
			</el-menu-item>
			<el-menu-item index="version" @click="goChild('version')">
				<i class="iconfont icon-upload"></i>
				<span slot="title">版本管理</span>
			</el-menu-item>
			<el-menu-item index="version" @click="goChild('version')">
				<i class="iconfont icon-upload"></i>
				<span slot="title">版本管理</span>
			</el-menu-item>
		</el-menu>
	</div>
</template>
<script>
//import Bus from './bus.vue'
import {mapState} from 'vuex'
export default {
    name: 'mahjong-menu',
	props: ['contentHeight'],
    data() {
        return {
//			height: window.height - 78,
//			showWidth: this.$store.state.showWidth,
            currentPage: ''
        };
    },
	computed: {
//		showWidth () {
//		  	return this.$store.state.showWidth
//		}
		...mapState(['showWidth']) // 引入vuex 里的变量
	},
    mounted() {
//		console.log('wwwww'+this.$store.state.contentHeight);
        var tabName = this.$route.name;
        this.currentPage = tabName;
//		Bus.$on('isShowMenu', (msg) => {
//			this.showWidth = msg
//		})
    },
    methods: {
		goChild(value) {
            this.$router.push('/' + value);
        }
    }
};
</script>
