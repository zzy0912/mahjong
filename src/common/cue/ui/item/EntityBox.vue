

<template>

<div>
    <el-autocomplete style="width:100%;" class="inline-input" v-model="entityLabel" :fetch-suggestions="querySearch" placeholder="请选择" :trigger-on-focus="false" @select="handleSelect">
        <el-button slot="append" icon="plus" @click="openSelect"></el-button>
    </el-autocomplete>
    <select-dialog :title="entitySelectTitle" size="small" ref="entitySelectDialog" :selectList="selector" @select="selectEntity"></select-dialog>
</div>

</template>

<script>

export default {
    name: 'entity-box',
    props: ['model', 'selector', 'value'],
    data: function() {
        return {
            entityLabel: '',
            entitySelectTitle: ''
        };
    },
    watch: {
        value: function(val) {
            if (val) {
                this.entityLabel = val.label;
            }
        }
    },
    methods: {
        querySearch: function(queryString, cb) {
            this.$cue.remoteService.call('model', 'getEntities', {
                target: this.model,
                filter: {
                    field: 'label',
                    match: 'LIKE',
                    value: queryString
                },
                pageSize: -1
            }).then(function(result) {
                for (let i = 0; i < result.list.length; i++) {
                    result.list[i].value = result.list[i].label;
                }
                cb(result.list);
            });
        },
        openSelect: function() {
            this.entitySelectTitle = '选择';
            if (this.$refs.entitySelectDialog.$parent) {
                let node = this.$refs.entitySelectDialog.$el;
                this.$refs.entitySelectDialog.$parent.$el.removeChild(node);
                this.$refs.entitySelectDialog.$parent = undefined;
                document.body.appendChild(node);
            }
            this.$refs.entitySelectDialog.open();
        },
        selectEntity: function(item) {
            this.$emit('input', item);
        },
        handleSelect: function(item) {
            this.$emit('input', item);
        }
    }
};

</script>
