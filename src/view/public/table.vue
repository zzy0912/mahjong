<style>
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
			:height="tableHeight"
			:data="tableData">
          	<template v-for="(item, index) in tableValue">
				<el-table-column v-if="item.template"
				:key="index"
				:fixed="item.btns?'right':''"
				:label="item.label">
				<template slot-scope="scope">
					<router-link v-if="item.link" :to="{name: item.link, params: {id:scope.row.id}, meta: scope.row.label }">{{ scope.row.label}}</router-link>
					<span v-if="item.enum">{{scope.row[item.prop].label}}</span>
					
					<span v-if="item.time">{{scope.row[item.prop] | formatDate}}</span>
					<el-tag v-if="item.tag" :type="scope.row.status===1?'success':'danger'">{{scope.row.status===1?'活跃':'禁用'}}</el-tag>
					<div v-if="item.org">
						<div v-for="(man,index1) in scope.row.manager" :key = 'index1'>
							<span>{{man.instance.label}}</span>
							<span>{{man.instance.phone}}</span>
						</div>
					</div>
<!--					<my-render v-if="item.render" :row="scope.row" :render="item.render"></my-render>-->
					<div v-if="item.btns">
						<el-button v-for="btn in item.btns" :key="btn.id" type="text" size="small" @click="handleOperation(btn.id, scope.row.id)">{{btn.label}}</el-button>
					</div>
				</template>
				</el-table-column>
				<el-table-column
					v-else
					:label="item.label"
					:prop="item.prop"
					:key="index">
				</el-table-column>
			</template>
		</el-table>
	</div>
</template>
<script>
import myRender from './myRender.vue';
export default {
    name: 'mahjong-table',
	props: ['tableValue', 'call'],
	components: {
		myRender
	},
    data() {
        return {
			tableData: []
        };
    },
	computed: {
		tableHeight () {
			let height = this.$store.state.contentHeight;
			if (this.$store.state.isShowBack) {
				height = height - 177;
			} else {
				height = height - 177;
			}
			return height;
		}
	},
    mounted() {
		console.log(this.contentHeight);
    },
    methods: {
		getEntities: function() {
			this.$cue.remoteService.call(this.call.service||'model', this.call.method||'getEntities', this.call.para).then((res) => {
				this.$store.state.pageTotal = res.totalCount;
                this.tableData = res.list;
                console.log(this.tableData);
            }, () => {
				this.$store.state.pageTotal = 1;
                this.tableData = [];
			});
		},
		handleOperation(btn, id) {
			this.$emit('handleOperation', btn, id);
		}
    }
};

</script>
