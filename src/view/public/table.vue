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
	<div>
		<div class="table-css">
			<el-table
				:data="tableData">
				<el-table-column v-for="item in tableValue"
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
	</div>
</template>
<script>
export default {
    name: 'mahjong-table',
	prop: ['tableData', 'tableValue'],
    data() {
        return {
			tableData: [],
            user: {label: 'admin'},
            dialogFormVisible: false,
            pswLock: true,
            form: {}
        };
    },
    mounted() {
    },
    methods: {
		getEntities: function(para, service, method) {
			this.$cue.remoteService.call(service||'model', method||'getEntities', para).then((res) => {
                this.tableData = res.list;
            });
		},
        
    }
};

</script>
