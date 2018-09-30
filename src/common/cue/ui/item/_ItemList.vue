<script>
    export default {
        data() {
            return {
                // 表格数据定义
                dataDesp: null,
                // 表格数据
                items: null,
                itemsTotalCount: 0,
                // 页面信息
                pageSize: 10,
                currentPage: 1,
                // 排序信息
                sort: undefined,
                // 额外过滤器
                extraFilter: undefined,
                fetchItemsWhenStart: true
            };
        },
        computed: {
            pageNo: function() {
                return this.currentPage - 1;
            }
        },
        mounted: function() {
            if (this.fetchItemsWhenStart) {
                this.fetchItems();
            }
        },
        methods: {
            setDataDesp: function(para) {
                this.$cue.dataService.setDataDespInCompo(this, para);
                this.fetchItems();
            },
            fetchItems: function() {
                let query_para = this.$cue.dataService.getQueryParaInCompo(this);
                this.$cue.dataService.fetchItemsInCompo(this, query_para);
            },
            // 排序变化
            onSortChange: function(sort) {
                if (sort.prop) {
                    this.sort = sort.prop + ' ' + (sort.order === 'ascending' ? 'ASC' : 'DESC');
                } else {
                    this.sort = undefined;
                }
                this.fetchItems();
            },
            // 过滤器变化
            modifyExtraFilter: function(field, value, updateItems) {
                this.$cue.dataService.modifyExtraFilter(this, field, value);
                if (updateItems) {
                    this.fetchItems();
                }
            },
            // 当前选择变化(包括单选和多选)
            onSelectionChange: function(val) {
                this.currentSelection = val;
            },
            isMultiSelect: function() {
                let table = this.$refs.table;
                for (let i = 0; i < table.columns.length; i++) {
                    if (table.columns[i].type === 'selection') {
                        return true;
                    }
                }
                return false;
            },
            getSelection: function() {
                return this.currentSelection;
            },
            isSelectionEmpty: function() {
                let sel = this.getSelection();
                return (!sel || (this.$cue.objectUtil.isArray(sel) && sel.length === 0));
            },
            deleteSelection: function() {
                if (this.isSelectionEmpty()) {
                    return;
                }
                let t = this;
                this.$cue.dataService.deleteItemInCompo(this, this.getSelection()).then(function() {
                    t.fetchItems();
                });
            }
        }
    };
</script>
