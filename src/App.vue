<template>
	<div id="app" style="height:100%;">
		<mMenu></mMenu>
		<mHeader></mHeader>
		<div class="box" style="background-color:#F3F3F3;padding: 15px 15px 0;height:100%;overflow:auto;">
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

export default {
  	name: 'App',
	components: {
		mMenu,
		mHeader
	},
	data() {
		return {
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
