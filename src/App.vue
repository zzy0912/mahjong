<template>
	<div id="app">
		<mahjong-menu></mahjong-menu>
		<mahjong-header :ac="ab"></mahjong-header>
		<div class="box" style="background-color:#F3F3F3;padding: 15px 15px 0;overflow:auto;" :style="`height:${height}px`">
            <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key = 'index' :to="{ path: item.path }">{{item.label}}</el-breadcrumb-item>
            </el-breadcrumb> -->
            <div v-show="isShowBack" id="backBtn" class="main-font" style="padding: 10px 0;font-size:16px;cursor:pointer;" @click="goBack"><i class="el-icon-back"></i>&nbsp;&nbsp;返回</div>
            <router-view :tableHeight="isShowBack?(height-241):(height-200)"></router-view>
        </div>
	</div>
</template>

<script>
import mmenu from './view/public/menu.vue';
import mheader from './view/public/header.vue';

export default {
  	name: 'App',
	components: {
		'mahjong-menu': mmenu,
		'mahjong-header': mheader
	},
	data() {
		return {
			height: document.body.clientHeight - 78,
			isShowBack: false
		}
	},
	mounted() {},
	methods: {
		goBack: function() {
            this.$router.back();
        }
	}
};
</script>
