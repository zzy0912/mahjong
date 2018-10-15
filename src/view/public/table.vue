<style>
    .table-css {
	  margin: 15px 0;
	  padding: 20px;
	  background: #ffffff;
	}
	.demo-table-expand {
	  font-size: 0;
	}
	.demo-table-expand label {
	  width: 120px;
	  color: #99a9bf;
	}
	.demo-table-expand .el-form-item {
	  margin-right: 0;
	  margin-bottom: 0;
	  width: 50%;
	}
</style>
<template>
	<div class="table-css">
		<el-table
			style="height:100%"
			:data="tableData">
			<el-table-column v-for="item in tableValue"
			:key="item.prop"
			:fixed="item.btn?'right':''"
			:prop="item.prop"
			:label="item.label">
			<template slot-scope="scope" v-if="item.link">
				<router-link :to="{name: item.link, params:{id:scope.row.id}}">{{ scope.row[item.prop]}}</router-link>
			</template>
			<template slot-scope="scope" v-if="item.time">
				{{scope.row[item.prop] | formatDate}}
			</template>
			<template slot-scope="scope" v-if="item.tag">
				<el-tag :type="scope.row.status===1?'success':'danger'">{{scope.row.status===1?'活跃':'禁用'}}</el-tag>
			</template>
			<template slot-scope="scope" v-if="item.btn">
				<el-button type="text" size="small" @click="disableUSer(scope.row)">{{scope.row.status===1?'禁用':'解禁'}}</el-button>
			</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
import {mapState} from 'vuex'
export default {
    name: 'mahjong-table',
	props: ['tableValue', 'call'],
    data() {
        return {
			tableData: []
        };
    },
	computed: {
//		showWidth () {
//		  	return this.$store.state.showWidth
//		}
		...mapState(['pageTotal']) // 引入vuex 里的变量
	},
    mounted() {
		console.log(this.tableValue);
    },
    methods: {
		getEntities: function() {
			this.$cue.remoteService.call(this.call.service||'model', this.call.method||'getEntities', this.call.para).then((res) => {
				this.$store.state.pageTotal = res.totalCount;
                this.tableData = res.list;
            }, () => {
				this.$store.state.pageTotal = 1;
                this.tableData = [];
			});
		}
    }
};

</script>
