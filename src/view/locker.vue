<template>
	<div class="box" style="float:left;width:100%;height:100%;">
		<div class="white-bg box" style="padding:10px 20px;height:60px;">
			<el-input placeholder="请输入内容" v-model="searchLabel" class="input-with-select" style="max-width:360px;">
				<el-select v-model="selectType" slot="prepend" placeholder="请选择" style="width:80px;">
				<el-option label="名称" value="label"></el-option>
				<el-option label="电话" value="phone"></el-option>
				</el-select>
				<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
			</el-input>
		</div>
		<div class="table-css" style="height:auto;overflow:auto;">
			<div class="left locker">
				<div class="locker-title">
					<h5>小琪麻将馆</h5>
					<div></div>
				</div>
				
				<ul class="device-list">
					<li>
						<div>编号：90010<span class="right red">●</span></div>
						<div>出借人：张三<span class="right">2018-06-04</span></div>
					</li>
					<li>
						<div>编号：90010<span class="right red">●</span></div>
						<div>出借人：张三<span class="right">2018-06-04</span></div>
					</li>
					<li>
						<div>编号：90010<span class="right success-font">●</span></div>
<!--						<div>出借人：张三<span class="right success-font">2018-06-04</span></div>-->
					</li>
				</ul>
			</div>
		</div>	
	  	<mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
	</div>
</template>

<script>
import mTable from './public/table.vue';
import mpage from './public/page.vue';
var searchKey, selectType;
var para = {
    target: 'appUser',
    retFields: ['id', 'alipayId', 'wechatId', 'phone', 'status', 'lastLoginTime', 'deviceAlias', 'balance'],
    orderBy: ['id desc']
};
export default {
    props: [ 'tableHeight'],
	components: {
		mTable, mpage
	},
    data() {
        return {
            searchLabel: '',
            selectType: 'phone',
            tableValue: [],
            call: {}
        };
    },
	created: function() {
		this.tableValue = [{
			prop: 'lockerNo',
			label: '编号'
		}, {
			prop: 'shop',
			label: '所属商店'
		}, {
			prop: 'balance',
			label: '余额（元）'
		}, {
			prop: 'birth',
			label: '生日'
		}, {
			prop: 'gender',
			label: '性别'
		}, {
			prop: 'registerTime',
			label: '注册时间',
			time: true
		}];
	},
    mounted: function() {
        searchKey = null;
        selectType = null;
        this.$refs.table.getEntities();
    },
    methods: {
//        getEntities: function() {
//            para.start = this.pageStart;
//            para.count = this.pageCount;
//            para.filter = {};
//            if (this.searchLabel) {
//                para.filter = {
//                    field: this.selectType,
//                    match: 'LIKE',
//                    value: this.searchLabel
//                };
//            }
//            this.$cue.remoteService.call('webAppUser', 'getAppUserWithBalance', para).then(res => {
//                this.tableData = res.list;
//                this.pageTotal = res.totalCount;
//            });
//        },
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
            this.$ref.table.getEntities();
        }
//        disableUSer: function(val) {
//            var isDisable = val.status === 1;
//            this.$cue.remoteService.call('model', 'updateEntity', {
//                target: 'appUser',
//                entity: {
//                    id: val.id,
//                    status: isDisable ? 2 : 1
//                }
//            }).then(() => {
//                if (isDisable) {
//                    val.status = 2;
//                } else {
//                    val.status = 1;
//                }
//                this.$message({
//                    message: '操作成功！',
//                    type: 'success'
//                });
//            });
//        }
    }
};
</script>

<style>
	.locker {
		width: 200px;
		margin: 10px 0 10px 10px;
		border: 1px solid #dcdfe6;
	}
	.locker:first-child {
		margin-left: 0;
	}
	.locker-title {
		background-color: #f5f7fa;
		padding: 10px;
	}
	.device-list {
		border-top: 1px solid #dcdfe6;
		height: 300px;
		overflow: auto;
	}
	.device-list li {
		padding: 10px;
		border-bottom: 1px solid #dcdfe6;
	}
</style>
