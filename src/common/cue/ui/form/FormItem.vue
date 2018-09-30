<template>
  <div class="el-form-item" :class="{
    'is-error': validateState === 'error',
    'is-validating': validateState === 'validating',
    'is-required': isRequired || required
  }" :style="formItemStyle">
    <label :for="prop" class="el-form-item__label" :style="labelStyle" v-if="label">
      <slot name="label">{{label + form.labelSuffix}}</slot>
    </label>
    <div class="el-form-item__content" :style="contentStyle">
      <slot></slot>
      <transition name="el-zoom-in-top">
        <div class="el-form-item__error" v-if="validateState === 'error' && showMessage && form.showMessage">{{validateMessage}}</div>
      </transition>
    </div>
  </div>
</template>

<script>

import { FormItem } from 'element-ui';

export default {
    name: 'q-form-item',
    extends: FormItem,
    props: {
        labelPosition: String,
        contentWidth: String
    },
    computed: {
        formItemStyle() {
            let ret = {};
            let label_position = this.labelPosition || this.form.labelPosition;
            if (label_position === 'justify') {
                ret.display = 'flex';
            }
            return ret;
        },
        labelStyle() {
            let ret = {};
            let label_position = this.labelPosition || this.form.labelPosition;
            if (label_position === 'justify') {
                ret.flex = 'auto';
            } else if (label_position !== 'top') {
                let label_width = this.labelWidth || this.form.labelWidth;
                if (label_width) {
                    ret.width = label_width;
                }
            }
            return ret;
        },
        contentStyle() {
            let ret = {};
            let label_position = this.labelPosition || this.form.labelPosition;
            if (label_position === 'justify') {
                if (this.contentWidth) {
                    ret.width = this.contentWidth;
                }
            } else if (this.form.labelPosition !== 'top' && !this.form.inline) {
                let label_width = this.labelWidth || this.form.labelWidth;
                if (label_width) {
                    ret.marginLeft = label_width;
                }
            }
            return ret;
        }
    }
};

</script>

<style>
</style>
