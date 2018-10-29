<template>
  <div>
    <div class="white-bg box" style="padding:10px 20px;height:60px;">
        <div class="left">
            <el-input placeholder="请输入公司名称" v-model="searchLabel" class="input-with-select">
                <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
            </el-input>
        </div>
        <!-- <el-button type="primary" style="margin-left:10px;" @click="exportXml">导出</el-button> -->
        <el-button class="right" @click="clickAddOrgBtn" type="text"><i class="iconfont icon-add"></i>&nbsp;添加公司</el-button>
    </div>
    <mTable ref="table" :tableValue="tableValue" :call="call" @handleOperation="handleOperation"></mTable>
    <mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
    <el-dialog title="添加公司" :visible.sync="dialogFormVisible">
    <el-form :model="form" label-width="150px">
        <el-form-item label="公司名称">
            <el-input v-model="form.label"></el-input>
        </el-form-item>
<!--
        <el-form-item label="充值权限">
            <el-switch v-model="form.isShowRecharge"></el-switch>
        </el-form-item>
-->
        <!-- <el-form-item label="是否需要交易密码">
            <el-switch v-model="form.enPassword"></el-switch>
        </el-form-item>
        <el-form-item label="密码" v-show="form.enPassword">
            <el-input v-model="form.password" placeholder="提现密码，长度不可小于6位"></el-input>
        </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrg">确 定</el-button>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import mTable from './../public/table.vue';
import mpage from './../public/page.vue';
var searchKey;
export default {
    props: [ 'tableHeight'],
    components: {
		mTable, mpage
	},
    data() {
        return {
            searchLabel: '',
            dialogFormVisible: false,
            form: {
                label: '',
                isShowRecharge: false
            },
            tableValue: [],
            call: {},
            companyId: -1
        };
    },
    created: function() {
		this.tableValue = [{
			prop: 'label',
			label: '公司名称',
			template: true,
			link: 'orgItem'
		}, {
			label: '联系人',
			template: true,
			org: true,
			render: function(){
				  return `<div v-if="scope.row.manager.length>0">
                    <div v-for="(man,index1) in scope.row.manager" :key = 'index1'>
                        <span>{{man.instance.label}}</span>
                        <span>{{man.instance.phone}}</span>
                    </div>
                </div>
                <span v-else>无</span>`
			}
		}, {
			btns: [{
              id: 1,
              label: '删除'
            }],
			template: true,
			label: '操作'
		}];
        this.call.para = {
            start: 0,
            count: 10,
            target: 'org',
            retFields: [{name: 'manager', retFields: [{name: 'instance', retFields: ['phone']}]}, 'isShowRecharge'],
            orderBy: ['id desc']
        };
	},
    mounted: function() {
        this.$cue.remoteService.call('model', 'getEntity', {
            target: 'org',
            filter: {
                field: 'type',
                match: 'EQ',
                value: 'company'
            }
        }).then((res) => {
            this.companyId = res.id;
            this.call.para['$opOrg.id'] = res.id;
            this.call.para.filter = {
                relation: 'AND',
                children: [{
                    field: 'parent',
                    match: 'EQ',
                    value: this.companyId
                }]
            };
            this.$refs.table.getEntities();
        });
    },
    methods: {
        getPropertys: function() {
            let t = this;
            para.start = t.pageStart;
            para.count = t.pageCount;
            if (t.searchLabel) {
                para.filter.children[1] = {
                    field: 'label',
                    match: 'LIKE',
                    value: t.searchLabel
                };
            }
            t.$cue.remoteService.call('model', 'getEntities', para).then(function(res) {
                t.tableData = res.list;
                t.pageTotal = res.totalCount;
            });
        },
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
                return;
            }
            this.pageStart = 0;
            searchKey = this.searchLabel;
            this.getPropertys();
        },
        clickAddOrgBtn: function() {
            this.dialogFormVisible = true;
        },
        addOrg: function() {
            // if (this.form.enPassword) {
            //     if (this.form.password) {
            //         if (this.form.password.length < 6) {
            //             this.$cue.uiService.showAlert('密码长度不可小于6位！', 'error', '提示');
            //             return;
            //         }
            //     } else {
            //         this.$cue.uiService.showAlert('请先输入密码！', 'error', '提示');
            //         return;
            //     }
            // }
            if (!this.form.label) {
                this.$cue.uiService.showAlert('请先输入公司名称！', 'error', '提示');
                return;
            }
            this.$cue.remoteService.call('model', 'updateEntity', {
                action: 0,
                target: 'org',
                entity: {
                    label: this.form.label,
//                    isShowRecharge: t.form.isShowRecharge,
                    type: 2,
                    // step: t.form.step ? 1 : 2,
                    parent: {
                        id: this.companyId
                    }
                }
            }).then((res) => {
//                t.$cue.remoteService.call('org', 'createTradeBody', {
//                    // enPassword: t.form.enPassword,
//                    orgId: res.id
//                    // password: t.form.password
//                });
                this.call.para.pageStart = 0;
//                t.pageStart = 0;
                // t.pageStart = (Math.floor(t.pageTotal / t.pageCount)) * t.pageCount;
                this.$refs.table.getEntities();
                this.$message({
                    message: '创建成功！',
                    type: 'success'
                });
                this.dialogFormVisible = false;
            });
            // t.$cue.remoteService.call('model', 'updateEntity', {
            //     target: 'user',
            //     entity: {
            //         label: t.form.manager,
            //         account: t.form.account
            //     }
            // }).then(function() {
            //     t.getProperty();
            //     t.$message('创建成功！');
            //     t.dialogFormVisible = false;
            // });
        },
        handleOperation: function(btn, id) {
            this.$confirm('此操作将永久删除该公司, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$cue.remoteService.call('model', 'deleteEntity', {
                    target: 'org',
                    id: id
                }).then(() => {
                    this.$refs.table.getEntities();
                    this.$message({
                        message: '已成功删除',
                        type: 'success'
                    });
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        }
        // exportXml: function() {
        //     this.$cue.remoteService.call('model', 'exportEntities', {
        //         type: 'xls',
        //         format: {
        //             encoding: 'GBK',
        //             fields: [
        //             'id',
        //             'label',
        //             'manager.instance.phone'
        //             ]
        //         },
        //         range: {
        //             target: para.target,
        //             nodes: [
        //                 {
        //                 subnodes: [
        //                     {
        //                     type: para.target,
        //                     filter: para.filter
        //                     }
        //                 ]
        //                 }, {
        //                     type: para.target
        //                 }
        //             ],
        //             '$opOrg.id': this.companyId
        //         }
        //     }).then(function(res) {
        //         uiService.getPublicDownloadUrlOfFile(res.url);
        //     });
        // }
    }
};
</script>

<style>
</style>
