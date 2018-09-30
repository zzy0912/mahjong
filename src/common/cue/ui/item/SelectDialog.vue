<template>
  <el-dialog :visible.sync="visible" :title="title" ref="dialog" :size="size">
    <component :is="componentType" ref="selectListInst" query-in-create="false" :multiSelect="multiSelect" ></component>
    <div slot="footer" style="display: flex; justify-content: space-around">
      <el-button @click="ok" >确定</el-button>
      <el-button @click="cancel" >取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
    export default {
        name: 'select-dialog',
        props: [ 'title', 'selectList', 'multiSelect', 'size' ],
        data() {
            return {
                visible: false,
                // 属性传入组件类型的初值
                componentType: this.selectList
            };
        },
        watch: {
            visible: function(val) {
                // 关闭对话框，清除组件。
                if (val === false) {
                    this.componentType = null;
                }
            }
        },
        methods: {
            open: function() {
                this.componentType = this.selectList;
                this.visible = true;
                if (this.$refs.selectListInst) {
                    this._open();
                } else {
                    this.$nextTick(() => { this._open(); });
                }
            },
            _open: function() {
                this.$refs.selectListInst.fetchItems();
            },
            close: function() {
                this.visible = false;
            },
            ok: function() {
                if (this.$refs.selectListInst.isSelectionEmpty()) {
                    this.$cue.uiService.showAlert('选中项为空，请重新选择！', 'error');
                    return;
                }
                // 发送select事件
                this.$emit('select', this.$refs.selectListInst.getSelection());
                this.$refs.dialog.hide();
            },
            cancel: function() {
                this.$refs.dialog.hide();
            }
        }
    };
</script>

<style>
</style>
