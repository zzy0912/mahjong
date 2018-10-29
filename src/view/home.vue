<template>
	<div class="home">
		<mMenu></mMenu>
		<mHeader></mHeader>
		<div class="box" :style="`background-color:#F3F3F3;padding: 15px 15px 0;overflow:auto;position: absolute;top: 78px;left:${showWidth}px;bottom:0;right:0;transition: left .3s ease-in-out;`">
            <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key = 'index' :to="{ path: item.path }">{{item.label}}</el-breadcrumb-item>
            </el-breadcrumb> -->
            <div v-show="isShowBack" id="backBtn" class="main-font" style="padding: 10px 0;font-size:16px;cursor:pointer;" @click="goBack"><i class="el-icon-back"></i>&nbsp;&nbsp;返回</div>
            <router-view style="height:100%;width:auto;"></router-view>
        </div>
	</div>
</template>

<script>
import mHeader from './public/header.vue';
import mMenu from './public/menu.vue';

import {mapState} from 'vuex';
export default {
  	name: 'App',
	components: {
		mHeader,
		mMenu
	},
	data() {
		return {
//			contentHeight: window.innerHeight - 78,
//			isShowBack: false,
			timer: false
		}
	},
	computed: {
//		showWidth () {
//		  	return this.$store.state.showWidth
//		}
		...mapState(['isShowBack', 'showWidth']) // 引入vuex 里的变量
	},
	created() {
		console.log("homeCreated");
	},
	beforeMount() {
		console.log("homeBeforeMount");
	},
	mounted() {
		console.log("homeMounted");
		window.onresize = () => {
			if (!this.timer) {
				this.timer = true;
				setTimeout(() => {
					this.timer = false;
					this.$store.state.contentHeight = window.innerHeight - 78;
					console.log(this.contentHeight);
				}, 500);
			}
		}
	},
	methods: {
		goBack: function() {
            this.$router.back();
        }
	}
};
</script>
