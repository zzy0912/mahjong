<template>
	<div id="app">
		<mMenu :contentHeight="contentHeight"></mMenu>
		<mHeader></mHeader>
		<div class="box" :style="`height:${contentHeight}px;background-color:#F3F3F3;padding: 15px 15px 0;overflow:auto;`">
            <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key = 'index' :to="{ path: item.path }">{{item.label}}</el-breadcrumb-item>
            </el-breadcrumb> -->
            <div v-show="isShowBack" id="backBtn" class="main-font" style="padding: 10px 0;font-size:16px;cursor:pointer;" @click="goBack"><i class="el-icon-back"></i>&nbsp;&nbsp;返回</div>
            <router-view></router-view>
        </div>
	</div>
</template>

<script>
import mMenu from './view/public/menu.vue';
import mHeader from './view/public/header.vue';
//import {mapState} from 'vuex'
export default {
  	name: 'App',
	components: {
		mMenu,
		mHeader
	},
	data() {
		return {
			contentHeight: window.innerHeight - 78,
			isShowBack: false
		}
	},
	mounted() {
		window.onresize = function() {
			this.contentHeight = window.innerHeight - 78;
			console.log(this.contentHeight);
		}
	},
	methods: {
		goBack: function() {
            this.$router.back();
        }
	}
};
</script>
