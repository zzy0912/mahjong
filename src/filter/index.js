import Vue from 'vue'
export default (function() {
    Vue.filter('formatDate', function(date, type) {
		if (!date) {
			return '';
		}
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		m = m < 10 ? '0' + m : m;
		var d = date.getDate();
		d = d < 10 ? ('0' + d) : d;
		var out = y + '-' + m + '-' + d;
		if (type === 'ss') {
			let h = date.getHours();
			h = h < 10 ? ('0' + h) : h;
			let mi = date.getMinutes();
			mi = mi < 10 ? ('0' + mi) : mi;
			let s = date.getSeconds();
			s = s < 10 ? ('0' + s) : s;
			out += ' ' + h + ':' + mi + ':' + s;
		}
		return out;
	});
})()
