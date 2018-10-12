<template>
  <div>
    <div class="white-bg" style="padding:10px 20px;">
        <div>
            <el-input placeholder="请输入内容" v-model="searchLabel" class="input-with-select">
                <el-select v-model="select" slot="prepend" placeholder="请选择">
                <el-option label="餐厅名" value="1"></el-option>
                <el-option label="订单号" value="2"></el-option>
                <el-option label="用户电话" value="3"></el-option>
                </el-select>
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
        </div>
    </div>
    <div class="white-bg" style="margin:20px 0;padding:0 20px;">
        <el-table
            :data="tableData"
            style="width: 100%;"
            tooltip-effect="dark"
            :default-sort = "{prop: 'unit'}"
            >
            <el-table-column
            prop="unit"
            label="单元"
            sortable
            width="100">
            </el-table-column>
            <el-table-column
            prop="floor"
            label="楼层"
            sortable
            width="100">
            </el-table-column>
            <el-table-column
            prop="houseNumber"
            label="门牌号"
            sortable
            width="100">
            </el-table-column>
            <el-table-column
            prop="name"
            label="姓名"
            width="120">
            </el-table-column>
			<el-table-column
            prop="type.type.label"
            label="类型"
            sortable
            width="100">
            </el-table-column>
            <el-table-column
            prop="phone"
            label="电话"
            width="150">
            </el-table-column>
            <el-table-column
            prop="balance"
            label="余额"
            width="100">
            </el-table-column>
            <el-table-column
            prop="status"
            label="状态"
            width="100">
            </el-table-column>
            <!-- <el-table-column
            prop="bill"
            label="账单明细"
            width="200">
            <template slot-scope="scope">
                <el-button @click="handleClick(scope.row)" type="text" size="small">充值记录</el-button>
                <el-button @click="handleClick(scope.row)" type="text" size="small">预设补货数量</el-button>
            </template>
            </el-table-column> -->
            <el-table-column
            prop="goElevator"
            label="充值记录"
            width="150">
            <template slot-scope="scope">
                <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
            </template>
            </el-table-column>
            <el-table-column
            fixed="right"
            label="操作"
            width="100">
            <template slot-scope="scope">
                <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button>
            </template>
            </el-table-column>
        </el-table>
    </div>
<!--
    <el-pagination style="margin-top:40px;"
    class="right"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="currentPage4"
    :page-sizes="[6, 10, 20]"
    :page-size="100"
    layout="total, sizes, prev, pager, next, jumper"
    :total="ownerTotal">
    </el-pagination>
    <item-dialog :itemForm="itemFormName" ref="itemDialog" title="编辑" :autoSubmit="true"></item-dialog>
-->
  </div>
</template>

<script>
//import Vue from 'vue';
//import ItemDialog from '../../common/cue/ui/item/ItemDialog';
//import AgentItemForm from './AgentItemForm';
//
//Vue.component(ItemDialog.name, ItemDialog);
//Vue.component(AgentItemForm.name, AgentItemForm);

export default {
  data() {
    return {
      searchLabel: '',
      itemFormName: 'agent-item-form',
      select: '',
      ownerTotal: 400,
      tableData: [{
          unit: 1,
          floor: 1,
          houseNumber: 101,
          date: '2016-05-02',
          name: '王小虎',
          phone: '13557974235',
          balance: 2.03,
          status: '审核中',
		  type: {
			  type: {
				  label: 'haha'
			  }
		  }
        }, {
          unit: 3,
          floor: 1,
          houseNumber: 101,
          date: '2016-05-02',
          name: '王小虎',
          phone: '13557974235',
          balance: 2.03,
          status: '使用中',
			type: {}
        }]
    };
  },
  methods: {
      handleClick(row) {
          console.log(row);
      },
      edit() {
          this.$refs.itemDialog.open(690);
      },
      onSubmit: function(submit_item) {
          this.$refs.itemDialog.ok(submit_item);
          // this.$emit('ok', submit_item);
      }
  }
};
</script>

<style>
</style>
