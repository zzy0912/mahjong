<template>
  <div class="item" :class="{ currentRow: highlightCurrentRow && active, nowrap: !wrap }"
    @click="onItemClick" @mouseover="handleHoverOpOver" @mouseout="handleHoverOpOut" :title="tooltip ? tooltip : label">
    <slot>{{label}}</slot>
  </div>
</template>

<script>

import _HoverOpEmitter from '../others/_HoverOpEmitter';

export default {
    name: 'ListItem',
    props: {
        label: { type: String, default: '' },
        tooltip: { type: String, default: '' },
        name: { },
        wrap: { type: Boolean, default: false },
        highlightCurrentRow: { type: Boolean, default: true }
    },
    mixins: [ _HoverOpEmitter ],
    data() {
        return {
            active: false
        };
    },
    methods: {
        onItemClick() {
            this.$emit('item-click', this);
        },
        setActive(value) {
            this.active = value;
        }
    }
};
</script>

<style lang="scss" scoped>
$itemHeight: 32px;
.item {
  height: $itemHeight;
  line-height: $itemHeight;
  padding-left: 20px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background: #E4E8F1;
  }
}
.nowrap {
  white-space: nowrap;
}
.currentRow {
  background: #EDF7FF;
}
</style>
