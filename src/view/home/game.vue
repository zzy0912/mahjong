<template>
	<div>
		<div class="white-bg box" style="padding:10px 20px;height:60px;">
			<el-input placeholder="请输入内容" v-model="searchLabel" class="input-with-select" style="max-width:360px;">
				<el-select v-model="selectType" slot="prepend" placeholder="请选择" style="width:80px;">
				<el-option label="名称" value="label"></el-option>
				<el-option label="电话" value="phone"></el-option>
				</el-select>
				<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
			</el-input>
		</div>
		<div class="white-bg thin-scroll" :style="`height:${contentHeight-137}px;overflow:auto;margin:15px 0;position:relative;`">
			<div class="left locker">
				<div class="locker-title">
					<div class="row">
						<div class="col">设备机：123432222</div>
						<div class="col text-right line-ellipsis">
							小琪麻将馆<br>
							2012-3-3
						</div>
					</div>
				</div>
				<ul class="device-list">
					<li class="row text-center">
						<div class="col">王伟</div>
						<div class="col">8</div>
						<div class="col">李逵</div>
					</li>
					<li class="row text-center">
						<div class="col">李白</div>
						<div class="col">18</div>
						<div class="col">李逵</div>
					</li>
					<li class="row text-center">
						<div class="col">李白</div>
						<div class="col">12</div>
						<div class="col">杜甫</div>
					</li>
					<li class="row text-center">
						<div class="col">王伟</div>
						<div class="col">12</div>
						<div class="col">杜甫</div>
					</li>
				</ul>
			</div>
<!--			<div v-if="mData.length===0" class="vertical-center">暂无数据</div>-->
		</div>	
	  	<mpage @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></mpage>
		<el-dialog title="新建设备" :visible.sync="dialogVisible">
			<org-sel ref="selOrg"></org-sel>
<!--			<el-input-number v-model="num1" @change="handleChange" :min="1" :max="10" label="麻将机数量"></el-input-number>-->
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addLock">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import orgSel from './../public/orgSel.vue';
import mpage from './../public/page.vue';
import {mapState} from 'vuex';
var searchKey, selectType;
var para = {
    target: 'locker',
    retFields: ['lockerNo', {name: 'org', retFields: ['parent']}, {name: 'devices', retFields: ['status', 'leaseman', 'outTime', 'deviceNo']}],
    orderBy: ['id desc']
};
export default {
	components: {
		orgSel, mpage
	},
	computed: {
		...mapState(['contentHeight']) // 引入vuex 里的变量
	},
    data() {
        return {
			dialogVisible: false,
			mData: [],
            searchLabel: '',
            selectType: 'phone',
			pageStart: 0,
            pageCount: 10
        };
    },
	created: function() {
//		this.mData = [{
//			id: 1,
//			
//		}]
		searchKey = null;
        selectType = null;
//        this.getEntities();
	},
    mounted: function() {
        
    },
    methods: {
        getEntities: function() {
            para.start = this.pageStart;
            para.count = this.pageCount;
            if (this.searchLabel) {
                para.filter = {
                    field: this.selectType,
                    match: 'LIKE',
                    value: this.searchLabel
                };
            }
            this.$cue.remoteService.call('model', 'getEntities', para).then(res => {
                this.mData = res.list;
                this.$store.state.pageTotal = res.totalCount;
            });
        },
		handleSizeChange: function(val) {
			this.pageStart = 0;
			this.pageCount = val;
			this.getEntities();
		},
		handleCurrentChange: function(val) {
			this.pageStart = val;
			this.getEntities();
		},
        search: function() {
            if (this.searchLabel === searchKey) {
                if (this.selectType === selectType) {
                    return;
                }
            }
            searchKey = this.searchLabel;
            selectType = this.selectType;
            this.getEntities();
        },
        addLock: function() {
			if (!this.$refs.selOrg.id) {
				return;
			}
			this.$cue.remoteService.call('model', 'updateEntity', {
				target: 'locker',
				entity: {
					shop: this.$refs.selOrg.id
				}
			}).then(() => {
				this.dialogVisible = false;
				this.$message({
					message: '操作成功！',
					type: 'success'
				});
			});
        },
		addDevice: function(locker) {
			this.$confirm('确定新加一个设备机?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
				this.$cue.remoteService.call('model', 'updateEntity', {
					target: 'device',
					entity: {
						status: 1,
						locker: locker.id
					}
				}).then((res) => {
					locker.devices.push({id: res.id, status: {id: 1, label: 'In'}});
					this.$message({
						message: '操作成功！',
						type: 'success'
					});
				});
			});
		},
		delDevice: function(id, devices, index) {
			this.$confirm('确定删除该设备机?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
				this.$cue.remoteService.call('model', 'deleteEntity', {
					target: 'device',
					id: id
				}).then((res) => {
					devices.splice(index, 1);
					this.$message({
						message: '操作成功！',
						type: 'success'
					});
				});
			});
		}
    }
};
</script>

<style>
	.locker {
		width: 260px;
		margin: 20px;
		border: 1px solid #dcdfe6;
	}
/*
	.locker:first-child {
		margin-left: 0;
	}
*/
	.locker-title {
		background-color: #f5f7fa;
		padding: 10px;
	}
	.locker-title h5 {
		text-align: center;
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
