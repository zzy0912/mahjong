<template>
	<el-pagination
		class="right"
		@size-change="handleSizeChange"
		@current-change="handleCurrentChange"
		:current-page="currentPage"
		:page-sizes="[6, 10, 20]"
		:page-size="pageCount"
		layout="total, sizes, prev, pager, next, jumper"
		:total="pageTotal">
	</el-pagination>
</template>
<script>
import {mapState} from 'vuex'
export default {
    name: 'mahjong-page',
    data() {
        return {
			pageCount: 6,
			currentPage: 1
        };
    },
	computed: {
//		showWidth () {
//		  	return this.$store.state.showWidth
//		}
		...mapState(['pageTotal']) // 引入vuex 里的变量
	},
    mounted() {
    },
    methods: {
		handleSizeChange: function(val) {
			this.pageCount = val;
			this.$emit('handleSizeChange', this.pageCount);
		},
		handleCurrentChange: function(val) {
			console.log(val);
			this.pageStart = (val - 1) * this.pageCount;
			this.$emit('handleCurrentChange', this.pageStart);
		}
    }
};

</script>
