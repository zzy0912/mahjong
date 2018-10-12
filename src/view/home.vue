<template>
	<div><div class="main"><div class="main-left"></div><div class="main-right"></div><div class="main-center">111</div></div><div>东方电视广告速度发发发的，罚款决定公开，设计方法，哦是的疯狂的疯狂开发，多少积分的风景，收到了付款撒的看法。。到付款撒打开V</div>
	</div>
	
</template>

<script>
export default {
	name: 'home',
	data () {
		return {
		  message: 'Welcome to Your Vue.js App',
		};
	},
	computed: {
		count () {
		  	return this.$store.state.count
		},
		exapm:{
            cache:false,
            get:function(){
                return Date.now()
            }
        },
		jxmessage: function() {
			console.log("read");
			return this.message.length;
		}
	},
	mounted: function(){
	},
	methods: {
		inc () {
		  	this.$store.commit('inc')
		},
		dec () {
			this.$store.commit('dec')
		},
		changeMes: function() {
			console.log("ss");
			if (this.message.length === 20) {
				return;
			}
			this.message = this.message.substr(0, this.message.length-1);
		},
		jxmessage2: function() {
			console.log("read2");
			return this.message.length;
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	*{
		box-sizing: border-box;
	}
	.main{
		background-color: black;
/*		overflow: hidden;*/
/*		margin:0 auto;*/
/*		height: 700px;*/
/*		position:relative; */
	}
	.main-left{
		width: 300px;
		height: 500px;
		background-color: #98FF1A;
/*		float: left;*/
		display: inline-block;
	}		
	.main-center{
		width: calc(100% - 610px);
		background-color: #8E8DCC;
		height: 500px;
		display: inline-block;
	}
	.main-right{
		width: 300px;
		height: 500px;
		background-color:#7CC0FF;
/*		float: right;*/
/*
		position: absolute;
		right: 0;
*/
		display: inline-block;
	}
</style>
