<template>
	<div>
		<div class="white-bg box" style="padding:10px 20px;height:60px;">
			<el-input placeholder="请输入内容" v-model="searchLabel" class="input-with-select" style="max-width:260px;">
				<el-select v-model="selectType" slot="prepend" placeholder="请选择" style="width:80px;">
					<el-option label="电话" value="phone"></el-option>
					<el-option label="名称" value="label"></el-option>
				</el-select>
				<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
			</el-input>
			<!-- <el-button type="primary" style="margin-left:10px;" @click="exportXml">导出</el-button> -->
			<el-button class="right" @click="clickAddOrgBtn" type="text"><i class="iconfont icon-add"></i>&nbsp;添加员工</el-button>
		</div>
		<mTable ref="table" :tableValue="tableValue" :call="call"></mTable>
		<mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
	</div>
</template>

<script>
import mTable from './../public/table.vue';
import mpage from './../public/page.vue';
var searchKey, selectType;
export default {
	components: {
        mTable, mpage
    },
	data() {
		return {
			tableValue: [{
				prop: 'user.jurisdiction',
				label: '所管组织'
			}, {
				prop: 'user.label',
				label: '姓名'
			}, {
				prop: 'user.phone',
				label: '联系方式'
			}, {
				prop: 'isValid',
				label: '状态'
			}, {
				btns: [{
					id: 1,
					label: '删除'
				}, {
					id: 2,
					label: '禁用'
				}],
				label: '操作'
			}],
			call: {
				para: {
					target: 'orgRoleUser',
					filter: {
						relation: 'AND',
                		children: [
							{
								field: 'role',
								match: 'EQ',
								value: 'member'
							}
						]
					},
    				retFields: [{name: 'user', retFields: ['phone', 'jurisdiction', 'isValid']}]
				}
			},
			searchLabel: '',
			selectType: 'phone'
		};
	},
	mounted: function() {
		searchKey = null;
        selectType = null;
		this.$refs.table.getEntities();
	},
	methods: {
		handleSizeChange: function(val) {
			this.call.para.start = 0;
			this.call.para.count = val;
			this.$refs.table.getEntities();
		},
		handleCurrentChange: function(val) {
			this.call.para.start = val;
			this.$refs.table.getEntities();
		},
        search: function() {
            if (this.searchLabel === searchKey) {
                if (this.selectType === selectType) {
                    return;
                }
            }
            searchKey = this.searchLabel;
            selectType = this.selectType;
            this.call.para.start = 0;
            if (this.searchLabel) {
                this.call.para.filter.children[1] = {
                    field: `user.${this.selectType}`,
                    match: 'LIKE',
                    value: this.searchLabel
                };
            }
            this.$refs.table.getEntities();
        },
		clickAddOrgBtn: function() {
			
		}
	}
};
</script>

<style>
</style>
