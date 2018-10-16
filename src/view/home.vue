<template>
<!--	<div>-->
		<div class="main">
			<div class="main-left">111</div>
			<div class="main-top"></div>
			<div class="main-center box"><div></div></div>
<!--			<div class="main-right"></div>-->
		</div>
<!--	</div>-->
	
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
/*
	*{
		box-sizing: border-box;
	}
*/
	.main{
		height: 100%;
/*		font-size: 0;*/
		background-color: black;
/*		overflow: hidden;*/
/*		margin:0 auto;*/
/*		height: 700px;*/
/*		position:relative; */
	}
	.main-left{
		width: 300px;
		height: 400px;
		background-color: #98FF1A;
		float: left;
/*
		display: inline-block;
		vertical-align:top
*/
	}		
	.main-top {
		height: 78px;
		margin-left: 300px;
		background: #fd1;
	}
	.main-center{
/*		width: calc(100% - 500px);*/
		background-color: #8E8DCC;
		height: 100%;
		padding: 10px;
/*
		display: inline-block;
		vertical-align:top
*/
	}
	.main-center div {
		height: 100%;
		background-color:#7CC0FF;
	}
	.main-right{
		width: 200px;
		height: 500px;
		background-color:#7CC0FF;
/*		float: right;*/
/*
		position: absolute;
		right: 0;
*/
		display: inline-block;
		vertical-align:top
	}
</style>
