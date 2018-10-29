<template>
  <div>
    <div class="left" style="color:#c0c4cc;width:180px;height:40px;border-radius:4px;border:1px solid #dcdfe6;padding-left:15px;line-height:40px;">
        <span :style="selOrg.label?'color:#606266;':''">{{selOrg.label?selOrg.label:(isGroup?'请选择集团':'请选择店面')}}</span>
        <i class="right el-input__icon el-icon-plus" @click="openOrgs"></i>
        <i class="right el-input__icon el-icon-circle-close" v-show="selOrg.id" @click="delSelOrg"></i>
    </div>
    <el-dialog title="请选择物业" :visible.sync="dialogGroupVisible">
		<div class="white-bg box" style="padding:10px 20px;height:60px;">
            <el-input placeholder="请输入内容" v-model="searchLabel" class="input-with-select" style="max-width:260px;">
                <el-button slot="append" icon="el-icon-search" @click="searchOrg"></el-button>
            </el-input>
        </div>
        <div class="table-css">
            <el-table
                :data="tableData"
                style="width: 100%;">
                <el-table-column
                label="选择">
                    <template slot-scope="scope">
                        <el-radio v-model="org" :label="scope.row">&nbsp;</el-radio>
                    </template>
                </el-table-column>
                <el-table-column
                prop="label"
                label="名称">
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
		<div slot="footer" class="dialog-footer">
			<el-button @click="dialogGroupVisible = false">取 消</el-button>
			<el-button type="primary" @click="submitOrg">确 定</el-button>
		</div>
    </el-dialog>
    <el-dialog title="请选择商店" :visible.sync="dialogOrgVisible">
        <div style="height:50vh;overflow:auto;">
            <el-tree node-key="id" :expand-on-click-node='false' :data="treeData" highlight-current @node-click="handleNodeClick"></el-tree>
        </div>
		<div slot="footer" class="dialog-footer">
			<el-button @click="dialogOrgVisible = false">取 消</el-button>
			<el-button type="primary" @click="submitOrg">确 定</el-button>
		</div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue';
var searchKey;
var para = {
    target: 'org',
    retFields: ['type', 'propertyCompany']
};
export default {
    name: 'org-sel',
    props: [ 'isGroup' ],
    data() {
        return {
            height: document.body.clientHeight,
            treeData: [],
            searchLabel: '',
            isChange: false,
            selOrg: {},
            org: {},
            // tableHeight: this.isDialog ? null : (document.body.clientHeight - 370),
            tableData: [],
            pageTotal: 0,
            currentPage: 1,
            pageStart: 0,
            pageCount: 10,
            dialogGroupVisible: false,
            dialogOrgVisible: false
        };
    },
    methods: {
        openOrgs: function() {
            this.isChange = false;
            if (this.isGroup) {
                this.dialogGroupVisible = true;
            } else {
                this.dialogOrgVisible = true;
            }
			this.getOrgs();
		},
		getOrgs: function() {
            para.start = this.pageStart;
            para.count = this.pageCount;
            para.filter = {};
            if (this.isGroup) {
                para.filter = {
                    relation: 'AND',
                    children: [{
                        field: 'type',
                        match: 'EQ',
                        value: 2
                    }]
                };
                if (this.searchLabel) {
                    para.filter.children.push({
                        field: 'label',
                        match: 'LIKE',
                        value: this.searchLabel
                    });
                }
                this.$cue.remoteService.call('model', 'getEntities', para).then(res => {
                    this.tableData = res.list;
                    this.pageTotal = res.totalCount;
                });
            } else {
                let opOrgId = Vue.cookie.get('orgId');
                var treePara = {
                    nodes: [
                        {
                            subnodes: [{
                                type: 'org',
                                region: null,
                                permission: {
                                    id: opOrgId,
                                    target: 'org',
                                    action: 'list'
                                },
                                filter: {
                                    field: 'id',
                                    match: 'EQ',
                                    value: opOrgId
                                }
                            }]
                        },
                        {
                            type: 'org',
                            // retFields: ['isShowRecharge'],
                            orderBy: ['id desc'],
                            subnodes: [{
                                type: 'org',
                                region: null,
                                filter: {
                                    field: 'parent',
                                    match: 'EQ',
                                    value: '$parentId'
                                },
                                permission: {
                                    id: opOrgId,
                                    target: 'org',
                                    action: 'list'
                                }
                            }]
                        }
                    ],
                    pageSize: 100,
                    start: 0,
                    countSize: 1000,
                    retHasChildren: true,
                    retMoreChildren: true,
                    retChildrenCount: false
                };
                // treePara.nodes[0].subnodes[0].permission.id = t.rootTree.id;
                // treePara.nodes[1].subnodes[0].permission.id = t.rootTree.id;
                // treePara.nodes[0].subnodes[0].filter = {
                //     field: 'id',
                //     match: 'EQ',
                //     value: t.rootTree.id
                // };
                this.$cue.remoteService.call('model', 'getEntityTree', treePara).then(res => {
                    this.treeData = res.list;
                });
            }
        },
        handleNodeClick: function(org) {
            this.org = org;
        },
        searchOrg: function() {
			if (this.searchLabel === searchKey) {
                return;
            }
            searchKey = this.searchLabel;
            this.getOrgs();
		},
		handleSizeChange: function(val) {
            this.pageCount = val;
            this.pageStart = 0;
            this.getOrgs();
        },
        handleCurrentChange: function(val) {
            console.log(val);
            this.pageStart = (val - 1) * this.pageCount;
            this.getOrgs();
        },
		delSelOrg: function() {
			if (this.selOrg.id) {
				this.org = {};
				this.selOrg = {};
				this.isChange = true;
			}
		},
		submitOrg: function() {
			if (!this.org.id) {
				return;
			}
			if (this.org.id === this.selOrg.id) {
				return;
			}
			this.isChange = true;
			this.selOrg = {
                id: this.org.id,
                label: this.org.label
            };
            console.log(this.org);
            if (this.isGroup) {
                this.dialogGroupVisible = false;
            } else {
                this.dialogOrgVisible = false;
            }
		}
    }
};
</script>

<style>
</style>
