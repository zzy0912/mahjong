<template>
  <div>
    <el-row :gutter="20">
    <el-col :span="6">
        <el-tree ref="orgTree" node-key="id" :expand-on-click-node='false' :data="treeData" highlight-current default-expand-all @node-click="handleNodeClick"></el-tree>
    </el-col>
    <el-col :span="18">
        <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane name="first">
            <span slot="label"><i class="el-icon-date"></i> 组织信息</span>
            <div class="white-bg" style="height:42px;">
                <el-button v-if="currentOrg.type.id === 2" class="right" type="text" @click="clickCreateOrg"><i class="el-icon-circle-plus"></i>&nbsp;新建子组织</el-button>
            </div>
            <el-form ref="org" :model="currentOrg" label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="currentOrg.label" :disabled=true></el-input>
                </el-form-item>
                <router-link style="margin-left:80px;" :to="{name:'locker',query: { lockerId: currentOrg.id}}"><i class="iconfont icon-goto"></i>&nbsp;查看麻将机</router-link>
                <!-- <div><router-link :to="{name:'orgItem',params:{orgId:scope.row.id}}">{{ scope.row.label }}</router-link><a href=""><i class="iconfont icon-goto"></i>进入小区</a></div> -->
<!--
                <el-form-item label="父组织" v-if="currentOrg.id!==rootTree.id">
                    <span>{{currentOrg.parent.label}}</span><el-button type="text" class="m-l10" @click="clickChangeParentOrgBtn" v-show="parentOrgs.length>0"><i class="el-icon-edit"></i>重新选择</el-button>
                </el-form-item>
-->
                <!-- <el-form-item>
                    <el-button type="primary" @click="updateCurrentOrg">保存</el-button>
                    <el-button>取消</el-button>
                </el-form-item> -->
            </el-form>
        </el-tab-pane>
        <el-tab-pane name="second">
            <span slot="label"><i class="el-icon-date"></i> 员工</span>
            <div style="position:absolute;right:20px;top:25px;">
                <el-button type="text" @click="clickAddUser"><i class="iconfont icon-add"></i>&nbsp;添加管理员</el-button>
                <el-button type="text" @click="clickCreateUser"><i class="iconfont icon-addUser"></i>&nbsp;新建管理员</el-button>
            </div>
			<mTable ref="table" :tableValue="tableValue" :call="call"></mTable>
			<mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
        </el-tab-pane>
        </el-tabs>
    </el-col>
    </el-row>
    <el-dialog title="更改父组织" :visible.sync="dialogParOrg">
    <div v-for="item in parentOrgs"
                :key="item.id"
    ><el-radio v-model="newParentOrg" :label="item">{{item.label}}</el-radio></div>
    <div slot="footer" class="dialog-footer">
        <el-button @click="dialogParOrg = false">取 消</el-button>
        <el-button type="primary" @click="changeParentOrg">确 定</el-button>
    </div>
    </el-dialog>
    <el-dialog :title="form.title" :visible.sync="dialogFormVisible">
    <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
        <el-input v-model="form.label"></el-input>
        </el-form-item>
        <div v-if="!form.isOrg">
            <el-form-item label="电话">
            <el-input v-model="form.phone"></el-input>
            </el-form-item>
            <el-form-item label="密码">
            <el-input v-model="form.password"></el-input>
            </el-form-item>
        </div>
        <div v-else>
            <el-form-item label="父组织">
            <el-input 
            v-model="currentOrg.label"
            :disabled="true">
            </el-input>
            </el-form-item>
            <el-form-item label="类型">
                <el-select v-model="form.region">
                    <el-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.label"
                    :value="item">
                    </el-option>
                </el-select>
            </el-form-item>
        </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
    </el-dialog>
    <el-dialog title="添加管理员" :visible.sync="dialogTableVisible">
    <user-table ref="itemDialog2" isSelect = true isDialog = true></user-table>
    <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddUser">确 定</el-button>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue';
import mTable from './../public/table.vue';
import mpage from './../public/page.vue';
//import userTable from './component/userTable';
var treePara = {
    nodes: [
        {
            subnodes: [{
                type: 'org',
                region: null,
                permission: {
                    target: 'org',
                    action: 'list'
                }
            }]
        },
        {
            type: 'org',
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
var isQuery = true;
export default {
//    components: {
//        userTable
//    },components: {
//        userTable
//    },
	components: {
		mTable, mpage
	},
    data() {
        return {
            orgType: null,
            treeData: [{}],
            activeName: 'first',
            rootTree: {
                id: Number(this.$route.params.id)
            },
            currentOrg: {
                id: Number(this.$route.params.id),
                parent: {},
                type: {}
            },
            dialogParOrg: false,
            parentOrgs: [],
            newParentOrg: null,
            dialogTableVisible: false,
            dialogFormVisible: false,
            org: {
                label: ''
            },
            options: [{
                id: 3,
                value: 'area',
                label: '区域'
            }, {
                id: 4,
                value: 'shop',
                label: '店面'
            }],
            form: {
                isOrg: true,
                region: null,
                title: '',
                label: '',
                password: '123456',
                phone: ''
            }
        };
    },
    mounted: function() {
        this.orgType = Number(Vue.cookie.get('orgType'));
        isQuery = true;
        let t = this;
        t.form.region = t.options[1];
        // let urlId = this.$route.params.orgId;
        treePara.nodes[0].subnodes[0].permission.id = t.rootTree.id;
        treePara.nodes[1].subnodes[0].permission.id = t.rootTree.id;
        treePara.nodes[0].subnodes[0].filter = {
            field: 'id',
            match: 'EQ',
            value: t.rootTree.id
        };
        t.getTree();
        // t.$refs.itemDialog1.getUser(t.currentOrg);
    },
    methods: {
        getTree: function(id) {
            let t = this;
            let item;
			t.treeData = [
				{
					"parent":{"id":219,"label":"公司"},
				 	"children":[{
						"parent":{"id":248,"label":"杭州宜兴麻将馆"},
						"$more":false,
						"id":402,
						"label":"小琪麻将馆",
						"type":{"id":3,"label":"商店"},
						"$type":"org"
					}],
					"$more":false,
					"id":248,
					"label":"杭州宜兴麻将馆",
					"type":{"id":2,"label":"集团"},
					"$type":"org"}
			];
//            t.$cue.remoteService.call('model', 'getEntityTree', treePara).then(function(res) {
                t.rootTree.type = t.treeData[0].type.id;
                if (id) {
                    t.$nextTick(function() {
                        t.$refs.orgTree.setCurrentKey(t.currentOrg.id);
                    });
                } else {
                    item = t.treeData[0];
                     t.currentOrg = {
                        id: item.id,
                        label: item.label,
                        parent: item.parent,
                        type: item.type
                    };
                    t.$nextTick(function() {
                        t.$refs.orgTree.setCurrentKey(t.currentOrg.id);
                    });
                }
                if (t.treeData[0].children) {
                    if (t.currentOrg.parent.id !== t.treeData[0].id) {
                        t.parentOrgs = [{id: t.treeData[0].id, label: t.treeData[0].label}];
                    } else {
                        t.parentOrgs = [];
                    }
                    t.getParentOrgs(t.treeData[0]);
                }
//            });
        },

        // children: [{
        //     id: 404,
        //     children: [{
        //         id: 404,
        //         children: []
        //     }, {
        //         id: 404,
        //         children: []
        //     }]
        // }, {
        //     id: 504,
        //     children: [{}, {}]
        // }]
        getAppointTreeItem: function(array, id) {
            let t = this;
            for (let i = 0;i < array.children.length; i++) {
                if (array.children[i].id === id) {
                    console.log(array.children[i]);
                    return array.children[i];
                }
                if (array.children[i].children) {
                    t.getAppointTreeItem(array.children[i], id);
                }
            }
        },
        getParentOrgs: function(array) {
            for (let i = 0; i < array.children.length; i++) {
                let item = array.children[i];
                if (item.type.id !== 4 && item.id !== this.currentOrg.parent.id) {
                    this.parentOrgs.push({
                        id: item.id,
                        label: item.label
                    });
                }
                if (item.children) {
                    this.getParentOrgs(item);
                }
            }
        },
        handleNodeClick: function(org) {
            let t = this;
            t.activeName = 'first';
            if (org.id === t.currentOrg.id) {
                return;
            }
            isQuery = true;
            t.pageStart = 0;
            t.currentOrg = org;
            if (t.currentOrg.parent.id !== t.treeData[0].id) {
                t.parentOrgs = [{id: t.treeData[0].id, label: t.treeData[0].label}];
            } else {
                t.parentOrgs = [];
            }
            t.getParentOrgs(t.treeData[0]);
            // t.$cue.remoteService.call('model', 'getEntities', {
            //     target: 'role',
            //     filter: {
            //     relation: 'OR',
            //     children: [
            //     {
            //         field: 'scopeType',
            //         match: 'EQ',
            //         value: 'global'
            //     },
            //     {
            //         field: 'scopeOrg',
            //         match: 'EQ',
            //         value: org.id
            //     },
            //     {
            //         field: 'scopeOrgType',
            //         match: 'EQ',
            //         value: org.type
            //     }
            //     ]
            // },
            // permission: {
            //     action: 'list'
            // },
            // retFields: [
            //     'name'
            // ]
            // }).then(function(res) {
            //     t.roles = res.list;
            // });
        },
        handleClick(tab) {
            if (tab.name === 'second' && isQuery) {
                // let value = 'manager';
                // if (this.currentOrg.id === this.rootTreeId) {
                //     value = 'member';
                // }
                this.$refs.table.getEntities();
                isQuery = false;
            }
        },
        changeRecharge: function() {
            this.$confirm(`确定${this.currentOrg.isShowRecharge ? '打开' : '关闭'}该物业的查看充值记录功能？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$cue.remoteService.call('model', 'updateEntity', {
                    action: 0,
                    target: 'org',
                    entity: {
                        isShowRecharge: this.currentOrg.isShowRecharge,
                        id: this.currentOrg.id,
                        $type: 'org',
                        $more: false
                    }
                }).then(() => {
                    this.treeData[0].isShowRecharge = this.currentOrg.isShowRecharge;
                    // this.getTree(res.id);
                    this.$message({
                        message: '修改成功！',
                        type: 'success'
                    });
                });
            }).catch(() => {
                this.currentOrg.isShowRecharge = !this.currentOrg.isShowRecharge;
            });
        },
        clickChangeParentOrgBtn: function() {
            if (this.currentOrg.id === this.treeData[0].id) {
                return;
            }
            this.dialogParOrg = true;
            // this.$cue.remoteService.call('model', 'getEntities', {
            //     target: 'org',
            //     filter: {
            //         relation: 'AND',
            //         children: [{
            //             field: 'parent',
            //             match: 'NE'
            //         }, {
            //             field: 'type',
            //             match: 'NE',
            //             value: 4
            //         }, {
            //             field: 'id',
            //             match: 'NE',
            //             value: this.currentOrg.id
            //         }]
            //     }
            // }).then(function(res) {
            //     t.parentOrgs = res.list;
            // });
        },
        changeParentOrg: function() {
            console.log(this.newParentOrg);
            this.currentOrg.parent = {
                id: this.newParentOrg.id,
                label: this.newParentOrg.label
            };
            this.$cue.remoteService.call('model', 'updateEntity', {
                action: 0,
                target: 'org',
                entity: {
                    // label: t.currentOrg.label,
                    parent: this.currentOrg.parent,
                    // isShowRecharge: t.currentOrg.isShowRecharge,
                    id: this.currentOrg.id,
                    $type: 'org',
                    $more: false
                }
            }).then((res) => {
                this.dialogParOrg = false;
                this.newParentOrg = {};
                this.getTree(res.id);
                this.$message({
                    message: '修改成功！',
                    type: 'success'
                });
            });
        },
        clickAddUser: function() {
            let t = this;
            t.dialogTableVisible = true;
            t.$nextTick(function() {
                t.$refs.itemDialog2.getNoManagerUser(t.treeData[0], t.currentOrg.id);
            });
        },
        clickCreateUser: function() {
            this.form.isOrg = false;
            this.form.title = '新建管理员';
            this.form.label = '';
            this.dialogFormVisible = true;
        },
        clickCreateOrg: function() {
            this.form.isOrg = true;
            this.form.title = '创建子组织';
            this.form.label = '';
            this.dialogFormVisible = true;
        },
        submitForm: function() {
            let t = this;
            if (this.form.isOrg) {
                t.$cue.remoteService.call('model', 'updateEntity', {
                    action: 0,
                    target: 'org',
                    entity: {
                        label: t.form.label,
                        // step: t.form.step ? 1 : 2,
                        parent: {
                            id: t.currentOrg.id
                        },
                        type: t.form.region.id
                    }
                }).then(function(res) {
                    isQuery = true;
                    t.currentOrg.parent = {
                        id: t.currentOrg.id,
                        label: t.currentOrg.label
                    };
                    t.currentOrg.id = res.id;
                    t.currentOrg.label = t.form.label;
                    t.currentOrg.type = t.form.region;
                    t.getTree(res.id);
                    t.$message({
                        message: '创建成功！',
                        type: 'success'
                    });
                    t.dialogFormVisible = false;
                });
            } else {
                t.$cue.remoteService.call('model', 'updateEntity', {
                    target: 'user',
                    entity: {
                        label: t.form.label,
                        account: t.form.phone,
                        password: t.form.password,
                        phone: t.form.phone,
                        isValid: true,
                        post: t.currentOrg.type.id - 1
                    }
                }).then(function(user) {
                    t.$cue.remoteService.call('org', 'addOrgRoleMembers', {
                        entityList: [{
                            role: 'manager',
                            user: user.id,
                            org: t.currentOrg.id
                        }]
                    }).then(function() {
                        t.$refs.itemDialog1.getUser(t.currentOrg);
                        t.$message({
                            message: '创建成功！',
                            type: 'success'
                        });
                        t.dialogFormVisible = false;
                    });
                });
            }
        },
        submitAddUser: function() {
            // console.log(this.$refs.itemDialog2.selectUser);
            let t = this;
            let selectUser = t.$refs.itemDialog2.selectUser;
            let entityList = [];
            let message = '确定要将该';
            if (selectUser.length > 0) {
                for (let i = 0; i < selectUser.length; i++) {
                    entityList.push({
                        role: 'manager',
                        user: selectUser[i].id,
                        org: t.currentOrg.id
                    });
                }
                message += selectUser.length + '人添加为' + t.currentOrg.label + '的管理员吗';
                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    t.$cue.remoteService.call('org', 'addOrgRoleMembers', {
                        entityList: entityList
                    }).then(function() {
                        t.$refs.itemDialog1.getUser(t.currentOrg);
                        t.$message({
                            message: '添加成功！',
                            type: 'success'
                        });
                        t.dialogTableVisible = false;
                    });
                });
            }
        }
    }
};
</script>

<style>
</style>
