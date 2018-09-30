<template>
  <div class="el-collapse-item" :class="{'is-active': isActive}" >
    <div class="el-collapse-item__header" ref="header"
      @click="handleHeaderClick" @mouseover="handleHoverOpOver" @mouseout="handleHoverOpOut">
      <i class="el-collapse-item__header__arrow el-icon-arrow-right"></i>
      <slot name="title">{{title}}</slot>
    </div>
    <el-collapse-transition>
      <div class="el-collapse-item__wrap" v-show="isActive">
        <div class="el-collapse-item__content" :class="{ 'collapse-item__no_padding': noPadding }" style="lineHeight: 0">
          <slot></slot>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import { CollapseItem } from 'element-ui';
import _HoverOpEmitter from './_HoverOpEmitter';

export default {
  name: 'CollapseItem',
    extends: CollapseItem,
    props: {
        noPadding: { type: Boolean, default: false }
    },
    mixins: [ _HoverOpEmitter ],
    methods: {
        handleHeaderClick() {
            this.dispatch('ElCollapse', 'item-click', this);
            this.$emit('item-header-click', this);
        }
    }
};
</script>

<style>
  .collapse-item__no_padding {
    padding: 0;
  }
</style>
