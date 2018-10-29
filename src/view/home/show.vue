<template>
<!--	<div>-->
		<div class="main">
<!--
			<div class="main-left"><div class="san"></div></div>
			<div class="main-top"></div>
			<div class="main-center box"><div></div></div>
-->
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
	mounted: function(){
		var div = document.getElementsByTagName("div");
		console.log(div.length);
//		var foo = (function() {
//		var secret = 1;
//		return {
//			get: function() {
//				console.log(secret);
//				return secret;
//			},
//			up: function() {
//				secret++;
//			}
//		}
//		}())
//		foo.get();
//		foo.up();
//		foo.get();
	},
	methods: {
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
