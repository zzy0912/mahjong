<template>
  <div class="el-collapse">
    <slot></slot>
  </div>
</template>
<script>

import { Collapse } from 'element-ui';

export default {
    name: 'Collapse',
    extends: Collapse,

    props: {
        // 保持至少一项处于展开状态
        keepExpand: Boolean
    },

    methods: {
        handleItemClick(item) {
            if (this.accordion) {
                if (this.keepExpand) {
                    if (this.activeNames[0] !== item.name) {
                        this.setActiveNames(item.name);
                    }
                } else {
                    this.setActiveNames(
                        (this.activeNames[0] || this.activeNames[0] === 0) &&
                        this.activeNames[0] === item.name
                            ? '' : item.name
                    );
                }
            } else {
                let activeNames = this.activeNames.slice(0);
                let index = activeNames.indexOf(item.name);

                if (index > -1) {
                    activeNames.splice(index, 1);
                } else {
                    activeNames.push(item.name);
                }
                this.setActiveNames(activeNames);
            }
        }
    }
};
</script>
