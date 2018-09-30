<template>
  <div class="list" :class="{ list__border: showBorder }">
    <div class="list__header" v-if="showHeader">{{title}}</div>
    <div >
      <div class="list__body">
        <slot></slot>
      </div>
      <p class="list__empty" v-show="$slots.default === undefined">{{emptyLabel}}</p>
    </div>
    <div class="list__footer" v-if="showFooter"></div>
  </div>
</template>

<script>

import ListItem from './ListItem';

export default {
    name: 'List',
    components: { ListItem },
    props: {
        showBorder: { type: Boolean, default: true },
        showHeader: { type: Boolean, default: false },
        showFooter: { type: Boolean, default: false },
        title: { type: String, default: '' },
        emptyLabel: { type: String, default: '暂无数据' }
    },
    methods: {
        setActiveItem: function(itemName) {
            this.$children.forEach(function(item) {
                item.setActive(item.name === itemName);
            });
        }
    }
};
</script>

<style lang="scss" scoped>
  .list {
    display: inline-block;
    position: relative;
  }
  $listBorder: 1px solid #d1dbe5;
  .list__border {
    border: $listBorder;
    box-shadow: 0 2px 4px rgba(0,0,0,.12), 0 0 6px rgba(0,0,0,.04);
  }
  $listHeaderHeight: 36px;
  .list__header {
    height: $listHeaderHeight;
    line-height: $listHeaderHeight;
    background: #fbfdff;
    margin: 0;
    padding-left: 20px;
    border-bottom: $listBorder;
    box-sizing: border-box;
    color: #1f2d3d;
  }
  .list__footer {
    height: 36px;
    background: #fff;
    margin: 0;
    padding: 0;
    border-top: $listBorder;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }
  .list__body {
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
  }
  $listEmptyHeight: 32px;
  .list__empty {
    margin: 0;
    height: $listEmptyHeight;
    line-height: $listEmptyHeight;
    padding: 6px 20px 0;
    color: #8391a5;
  }

</style>
