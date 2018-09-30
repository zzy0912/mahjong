<template>
  <div style="padding: 5px">
    <div style="display: flex; padding-bottom: 5px">
      <div style="flex: auto; line-height: 35px" >{{title}}</div>
      <el-input style="width: 250px; padding-right: 5px" v-model="searchValue" icon="search" :on-icon-click="fetchItems" @change="modifyExtraFilter('${search}', searchValue)"></el-input>
      <el-button @click="fetchItems">刷新</el-button>
      <el-button @click="createItem">新建</el-button>
      <el-button @click="editItem">编辑</el-button>
      <el-button @click="deleteSelection">删除</el-button>
    </div>
    <el-table highlight-current-row :border="true" :data="items" data-desp="${data}" columns="${columns}" @sort-change="onSortChange" @current-change="onSelectionChange">
    </el-table>
    <div style="display: flex; justify-content: center">
      <el-pagination :page-size="pageSize" :current-page.sync="currentPage" :total="itemsTotalCount" @current-change="fetchItems" layout="total,prev,pager,next"></el-pagination>
    </div>
    <item-dialog :title="dialogTitle" itemForm="${itemForm}" ref="dialog" @submit="onSubmit" size="large" >
    </item-dialog>
  </div>
</template>

<script>
    import Vue from 'vue';
    import _ItemList from './_ItemList';
    import ItemDialog from './ItemDialog';
    import ItemForm from '${itemFormPath}';

    Vue.component(ItemDialog.name, ItemDialog);
    Vue.component(ItemForm.name, ItemForm);

    export default {
        name: '${name}',
        extends: _ItemList,
        data() {
            return {
                title: '${title}',
                searchValue: undefined,
                dialogTitle: undefined
            };
        },
        methods: {
            createItem: function() {
                this.dialogTitle = '新建';
                this.$refs.dialog.open();

            },
            editItem: function() {
                if (this.isSelectionEmpty()) {
                    return;
                }
                this.dialogTitle = '编辑';
                let item_id = this.$cue.objectUtil.getObjectId(this.getSelection());
                this.$refs.dialog.open(item_id);
            },
            onSubmit: function() {
                this.fetchItems();
            }
        }
    };
</script>
