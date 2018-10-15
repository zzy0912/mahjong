<template>
	<div style="height:100%;overflow:hidden;">
		<div class="white-bg box" style="padding:10px 20px;height:60px;">
			<el-input placeholder="请输入内容" v-model="searchLabel" class="input-with-select" style="max-width:360px;">
				<el-select v-model="selectType" slot="prepend" placeholder="请选择" style="width:80px;">
				<el-option label="名称" value="label"></el-option>
				<el-option label="电话" value="phone"></el-option>
				</el-select>
				<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
			</el-input>
		</div>
		<mTable ref="table" :tableValue="tableValue" :call="call"></mTable>
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
</style>
