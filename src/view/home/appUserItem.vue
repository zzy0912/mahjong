<template>
  <div>
      <el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
        <el-tab-pane name="first">
            <span slot="label">基本信息</span>
            <el-form ref="form" :model="form" label-width="200px">
                <el-form-item label="用户名">
                    <el-input v-model="form.label"></el-input>
                </el-form-item>
				<el-form-item label="账号">
                    <el-input v-model="form.account" :disabled=true></el-input>
                </el-form-item>
                <el-form-item label="电话号码">
                    <el-input v-model="form.phone" :disabled=true></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio v-model="form.gender">男</el-radio>
  					<el-radio v-model="form.gender">女</el-radio>
                </el-form-item>
                <el-form-item label="余额">
                    <el-input v-model="form.balance" :disabled=true></el-input>
                </el-form-item>
                <el-form-item label="生日">
                    <el-date-picker
                    v-model="form.birth"
                    type="datetime">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="注册时间">
                    <el-date-picker
                    v-model="form.registerTime"
                    type="datetime"
                    :disabled=true>
                    </el-date-picker>
                </el-form-item>
				<el-form-item>
                    <el-button type="primary" @click="onSubmit">保存</el-button>
                </el-form-item>
            </el-form>
        </el-tab-pane>
        <el-tab-pane name="second">
            <span slot="label">好友</span>
            <mTable ref="table1" :tableValue="tableValue1" :call="call1"></mTable>
	  		<mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
        </el-tab-pane>
        <el-tab-pane name="three">
            <span slot="label">对局</span>
            <mTable ref="table2" :tableValue="tableValue2" :call="call2"></mTable>
	  		<mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
        </el-tab-pane>
        <el-tab-pane name="four">
            <span slot="label">消费记录</span>
            <mTable ref="table3" :tableValue="tableValue3" :call="call3"></mTable>
	  		<mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
        </el-tab-pane>
        </el-tabs>
<!--
        <el-dialog :visible.sync="dialogVisible">
            <img :src="facePicture" style="width:100%;"/>
        </el-dialog>
-->
  </div>
</template>

<script>
import mTable from './../public/table.vue';
import mpage from './../public/page.vue';
var allTab;
export default {
	components: {
		mTable, mpage
	},
    data() {
        return {
            activeName: 'first',
            formLabelWidth: '120px',
            form: {},
			call1: {
				para: {
					target: 'friend',
					filter: {
						field: 'member1',
						match: 'EQ',
						value: Number(this.$route.params.id)
					},
					retFields: ['member1', 'member2', 'delete1', 'delete2'],
					orderBy: ['id desc']
				}
			},
            tableValue1: [{
				prop: 'member1',
				enum: true,
				label: '用户',
				template: true
			}, {
				prop: 'member2',
				enum: true,
				template: true,
				label: '好友'
			}, {
				prop: 'delete1',
				label: '用户是否已删除'
			}, {
				prop: 'delete2',
				label: '对方是否已删除'
			}],
			call2: {
//				para: {
//					target: 'friend',
//					filter: {
//						field: 'member1',
//						match: 'EQ',
//						value: Number(this.$route.params.id)
//					},
//					retFields: ['member1', 'member2', 'delete1', 'delete2'],
//					orderBy: ['id desc']
//				}
			},
            tableValue2: [{
				prop: 'member1',
				enum: true,
				label: '用户',
				template: true
			}, {
				prop: 'member2',
				enum: true,
				template: true,
				label: '好友'
			}, {
				prop: 'delete1',
				label: '用户是否已删除'
			}, {
				prop: 'delete2',
				label: '对方是否已删除'
			}],
			call3: {
				para: {
					target: 'order',
					filter: {
						field: 'creator',
						match: 'EQ',
						value: Number(this.$route.params.id)
					},
					retFields: ['createTime', 'orderNo', 'orderAmount', 'payTime', 'payWay', 'status'],
					orderBy: ['id desc']
				}
			},
            tableValue3: [{
				prop: 'createTime',
				template: true,
				time: true,
				label: '创建时间'
			}, {
				prop: 'orderNo',
				label: '订单编号'
			}, {
				prop: 'orderAmount',
				label: '消费'
			}, {
				prop: 'payTime',
				template: true,
				time: true,
				label: '支付时间'
			}, {
				prop: 'payWay',
				label: '支付方式',
				enum: true,
				template: true
			}, {
				prop: 'status',
				label: '状态',
				enum: true,
				template: true
			}] 
        };
    },
    mounted: function() {
        allTab = {};
        this.getUser();
    },
    methods: {
        getUser: function() {
            this.$cue.remoteService.call('model', 'getEntity', {
                target: 'member',
                id: Number(this.$route.params.id),
                retFields: ['phone', 'account', 'balance', 'birth', 'gender', 'registerTime']
            }).then(res => {
                this.form = res;
            });
        },
		onSubmit: function() {
			
		},
        showFace: function(img) {
            this.facePicture = img;
            this.dialogVisible = true;
        },
        handleClick(tab) {
            switch (tab.name) {
                case 'first':
                    break;
                case 'second':
                    this.$refs.table1.getEntities();
                    break;
                case 'three':
                    this.$refs.table2.getEntities();
                    break;
                case 'four':
                    this.$refs.table3.getEntities();
                    break;
                default:
                    break;
            };
        },
		handleSizeChange: function(val) {
			this.call.para.start = 0;
			switch (tab.name) {
                case 'first':
                    break;
                case 'second':
					this.call1.para.start = val;
					this.$refs.table1.getEntities();
                    break;
                case 'three':
					this.call2.para.start = val;
                    this.$refs.table2.getEntities();
                    break;
                case 'four':
					this.call3.para.start = val;
                    this.$refs.table3.getEntities();
                    break;
                default:
                    break;
            };
		},
		handleCurrentChange: function(val) {
			switch (tab.name) {
                case 'first':
                    break;
                case 'second':
					this.call1.para.start = val;
					this.$refs.table1.getEntities();
                    break;
                case 'three':
					this.call2.para.start = val;
                    this.$refs.table2.getEntities();
                    break;
                case 'four':
					this.call3.para.start = val;
                    this.$refs.table3.getEntities();
                    break;
                default:
                    break;
            };
		}
    }
};
</script>

<style>
</style>
