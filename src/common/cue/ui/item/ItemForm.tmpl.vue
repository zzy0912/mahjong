<template>
  <div>
      <div style="display: flex;margin-bottom:15px;" v-show="!inDialog">
          <div style="flex: auto"></div>
          <el-button icon="edit" @click="submitItem">保存</el-button>
      </div>
      <el-form ref="$itemForm" label-width="${labelWidth|80px}" data-desp="${data|}" :rules="rules" >
        <box content="${content|}" />
      </el-form>
  </div>
</template>

<script>

    import _ItemForm from './_ItemForm';

    export default {
        name: '${name|}',
        extends: _ItemForm,
        data() {
            return {
                urlId: '${urlId|}',
                item: _item_init,
                selectOptions: _selectOptions_init,
                rules: ${rules|null}
            };
        },
        methods: {
            getItemInitialValue: function() {
                return Object.assign({}, _item_init);
            }
        }
    };
</script>

<style>
</style>
