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
import mTable from './../public/table.vue';
import mpage from './../public/page.vue';
var searchKey, selectType;
var para = {
    target: 'member',
    retFields: ['phone', 'account', 'balance', 'birth', 'gender', 'registerTime'],
    orderBy: ['id desc']
};
export default {
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
			prop: 'label',
			label: '用户',
			template: true,
			link: 'appUserItem'
		}, {
			prop: 'account',
			label: '账号'
		}, {
			prop: 'phone',
			label: '电话'
		}, {
			prop: 'balance',
			label: '余额（元）'
		}, {
			prop: 'birth',
			template: true,
			time: true,
			label: '生日'
		}, {
			prop: 'gender',
			template: true,
			enum: true,
			label: '性别'
		}, {
			prop: 'registerTime',
			label: '注册时间',
			template: true,
			time: true
		}];
		this.call.para = para;
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
