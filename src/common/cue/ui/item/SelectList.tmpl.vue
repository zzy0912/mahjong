<template>
  <div>
    <div style="display: flex; padding-bottom: 5px">
      <el-input style="width: 250px" v-model="searchValue" icon="search" :on-icon-click="fetchItems" @keyup.enter.native="fetchItems" @change="modifyExtraFilter('${search}', searchValue)"></el-input>
      <div style="flex: auto" ></div>
      <el-pagination :page-size="pageSize" :current-page.sync="currentPage" :total="itemsTotalCount" @current-change="fetchItems" layout="total,prev,pager,next"></el-pagination>
    </div>
    <el-table ref="table" highlight-current-row :border="true" :data="items" data-desp="${data}" columns="(type=selection)|${columns}" @sort-change="onSortChange">
    </el-table>
  </div>
</template>

<script>
  import _ItemList from './_ItemList';
    export default {
        name: '${name}',
        extends: _ItemList,
        props: [ 'multiSelect' ],
        data() {
            return {
                searchValue: undefined
            };
        },
        mounted: function() {
            // 缺省单选
            let table = this.$refs.table;
            if (this.multiSelect !== true) {
                table.store.commit('removeColumn', table.columns[0]);
                table.$on('current-change', this.onSelectionChange);
            } else {
                table.$on('selection-change', this.onSelectionChange);
            }
        }
    };
</script>

<style>
</style>
