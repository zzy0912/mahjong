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
    <div class="table-css">
        <el-table
            :data="tableData"
            style="width: 100%;"
            :height="tableHeight">
            <el-table-column
            label="用户">
            <template slot-scope="scope">
                <router-link :to="{name:'appUserItem',params:{id:scope.row.id}}">{{ scope.row.phone || scope.row.wechatId }}</router-link>
            </template>
            </el-table-column>
            <el-table-column
            label="余额（元）">
            <template slot-scope="scope">
                {{scope.row.balance | formatMoney}}
            </template>
            </el-table-column>
            <el-table-column
            prop="alipayId"
            label="支付宝id">
            </el-table-column>
            <el-table-column
            prop="wechatId"
            label="微信id">
            </el-table-column>
            <el-table-column
            prop="deviceAlias"
            label="登录设备">
            </el-table-column>
            <el-table-column
            label="最近登录">
            <template slot-scope="scope">
                {{scope.row.lastLoginTime | formatDate}}
            </template>
            </el-table-column>
            <el-table-column
            prop="status.label"
            label="状态">
            <template slot-scope="scope">
                <el-tag :type="scope.row.status===1?'success':'danger'">{{scope.row.status===1?'活跃':'禁用'}}</el-tag>
            </template>
            </el-table-column>
            <el-table-column
            fixed="right"
            label="操作">
            <template slot-scope="scope">
                <!-- <a href="/202">编辑</a> -->
                <el-button type="text" size="small" @click="disableUSer(scope.row)">{{scope.row.status===1?'禁用':'解禁'}}</el-button>
            </template>
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
  </div>
</template>

<script>
var searchKey, selectType;
var para = {
    target: 'appUser',
    retFields: ['id', 'alipayId', 'wechatId', 'phone', 'status', 'lastLoginTime', 'deviceAlias', 'balance'],
    orderBy: ['id desc']
};
export default {
    props: [ 'tableHeight'],
    data() {
        return {
            searchLabel: '',
            selectType: 'phone',
            tableData: [],
            pageTotal: 0,
            currentPage: 1,
            pageStart: 0,
            pageCount: 10
        };
    },
    mounted: function() {
        searchKey = null;
        selectType = null;
        this.getEntities();
    },
    methods: {
        getEntities: function() {
            para.start = this.pageStart;
            para.count = this.pageCount;
            para.filter = {};
            if (this.searchLabel) {
                para.filter = {
                    field: this.selectType,
                    match: 'LIKE',
                    value: this.searchLabel
                };
            }
            this.$cue.remoteService.call('webAppUser', 'getAppUserWithBalance', para).then(res => {
                this.tableData = res.list;
                this.pageTotal = res.totalCount;
            });
        },
        handleSizeChange: function(val) {
            this.pageCount = val;
            this.pageStart = 0;
            this.getEntities();
        },
        handleCurrentChange: function(val) {
            console.log(val);
            this.pageStart = (val - 1) * this.pageCount;
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
        disableUSer: function(val) {
            var isDisable = val.status === 1;
            this.$cue.remoteService.call('model', 'updateEntity', {
                target: 'appUser',
                entity: {
                    id: val.id,
                    status: isDisable ? 2 : 1
                }
            }).then(() => {
                if (isDisable) {
                    val.status = 2;
                } else {
                    val.status = 1;
                }
                this.$message({
                    message: '操作成功！',
                    type: 'success'
                });
            });
        }
    }
};
</script>

<style>
</style>
