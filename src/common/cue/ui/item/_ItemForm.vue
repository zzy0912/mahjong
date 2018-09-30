<script>
    export default {
        props: [ 'dispatchItemId', 'inDialog' ],
        data: function() {
            return {
                itemId: undefined,
                item: this.getItemInitialValue(),
                cascaderProps: { value: 'id' }
            };
        },
        mounted: function() {
            if (this.dispatchItemId) {
                this.itemId = this.dispatchItemId;
            }
            // 如果item id在url中出现，监视url的变化。
            if (!this.inDialog && this.urlId) {
                if (!this.itemId) {
                    this.itemId = this.$cue.objectUtil.getNewId(this.$route.params[this.urlId]);
                }
                this._enableWatchUrl = true;
                let t = this;
                this.$watch('$route.params.' + t.urlId, function(newVal) {
                    if (t._enableWatchUrl) {
                        t.itemId = t.$cue.objectUtil.getNewId(newVal);
                        t.item = t.getItemInitialValue();
                        t.fetchItem();
                    }
                });
            }
            this.itemId = this.itemId || -1;
            this.fetchItem();
        },
        methods: {
            getItemInitialValue: function() {
                return {};
            },
            getItemDefaultValue: function() {
                return this.$cue.dataService.getItemDefaultValueInCompo(this);
            },
            fetchItem: function() {
                this.$cue.dataService.fetchItemInCompo(this, this.itemId);
            },
            submitItem: function(handlers) {
                let t = this;
                return new Promise((resolve, reject) => {
                    t.$cue.dataService.submitItemInCompo(t, t.itemId, handlers).then(function(result) {
                        if (t.itemId <= 0) {
                            t.itemId = result.id;
                            if (t.urlId) {
                                // 这里修改url，会触发后面watch的代码，重新查询一次。所以这里可以处理一下，避免多余的查询。
                                t._enableWatchUrl = false;
                                let router_para = {};
                                router_para[t.urlId] = t.itemId;
                                t.$router.replace({ params: router_para });
                                // 注意：这里watch代码不是马上触发的，所以要到nextTick再打开。
                                t.$nextTick(function() {
                                    t._enableWatchUrl = true;
                                });
                            }
                        }
                        resolve(result);
                    }, function() {
                        reject();
                    });
                });
            },
            // 校验输入数据是否正确。返回Promise，如果验证通过，调用resolve。如果验证失败，调用reject
            validateItem: function() {
                let t = this;
                return new Promise((resolve, reject) => {
                    if (t.$refs.$itemForm && t.$refs.$itemForm.validate) {
                        t.$refs.$itemForm.validate(valid => {
                            if (valid) {
                                resolve();
                            } else {
                                reject('输入错误');
                            }
                        });
                    } else {
                        resolve();
                    }
                });
            },
            getSubmitItem: function() {
                return this.$cue.dataService.getSubmitItemInCompo(this, this.itemId);
            }
        }
    };
</script>
