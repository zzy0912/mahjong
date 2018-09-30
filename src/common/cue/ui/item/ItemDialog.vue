<template>
  <el-dialog :visible.sync="visible" :title="title" ref="dialog" :size="size">
    <component :is="componentType" ref="itemFormInst" :dispatchItemId="itemId" :inDialog="true" ></component>
    <div slot="footer" style="display: flex; justify-content: space-around">
      <el-button @click="ok" >确定</el-button>
      <el-button @click="cancel" >取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
    export default {
        name: 'item-dialog',
        props: [ 'title', 'itemForm', 'size', 'autoSubmit' ],
        data() {
            return {
                visible: false,
                // 属性传入组件类型的初值
                componentType: this.itemForm,
                itemId: -1,
                submitItemHandlers: null
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
            open: function(itemId) {
                this.itemId = itemId;
                this.componentType = this.itemForm;
                this.visible = true;
            },
            close: function() {
                this.visible = false;
            },
            ok: function() {
                let t = this;
                if (this.$refs.itemFormInst.validateItem) {
                    this.$refs.itemFormInst.validateItem().then(() => {
                        t._ok();
                    }, () => {
                        t.$message({
                            type: 'error',
                            message: '输入错误，无法提交'
                        });
                    });
                } else {
                    t._ok();
                }
            },
            _ok: function() {
                if (this.autoSubmit) {
                    let t = this;
                    this.$refs.itemFormInst.submitItem(this.submitItemHandlers).then(function(result) {
                        // 发送submit事件
                        t.$emit('submit', result);
                    }, function() { });
                } else {
                    let submit_item = this.$refs.itemFormInst.getSubmitItem();
                    this.$emit('submit', submit_item);
                }
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
