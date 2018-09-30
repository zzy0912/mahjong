<script>
// hoverOpCreator：Function，不能为空。生成操作栏的操作按钮。
//  @param category：String，可以为空。如果要处理多组操作按钮，需要设置category
//  @return：dom node数组。这些dom node用于加入到操作栏上。
// hoverOpHandler：Function，可以为空。用于在显示时，处理操作按钮是否显示。
//  @param opItems：dom node数组，操作按钮的dom node数组
//  @param:compo：对应的item的组件
//  @param el：对应的item的div
//  @param category：String，可以为空。如果要处理多组操作按钮，需要设置category
export default {
    data() {
        return {
            hoverOp: {},
            hoverOpCompo: {},
            isHoverOpLock: false,
            disableHoverOp: false
        };
    },
    methods: {
        showHoverOp(compo, el, category) {
            if (this.disableHoverOp || this.isHoverOpLock) {
                return;
            }
            category = category || 'default';

            this.hoverOpCompo[category] = compo;
            if (!this.hoverOp[category]) {
                let op_items = this.hoverOpCreator(category);
                let div = document.createElement('div');
                this.$cue.domUtil.addClass(div, 'hoverOp');
                op_items.forEach(function(item) {
                    div.appendChild(item);
                });
                this.hoverOp[category] = div;
            }
            let hover_op = this.hoverOp[category];
            el.style.position = 'relative';
            el.appendChild(hover_op);
            if (this.hoverOpHandler) {
                this.hoverOpHandler(hover_op.childNodes, compo, el, category);
            }
            hover_op.style.display = 'flex';
        },
        lockHoverOp(val, category) {
            this.isHoverOpShow = val;
            category = category || 'default';
            let hover_op_compo = this.hoverOpCompo[category];
            if (hover_op_compo) {
                hover_op_compo.isHoverOpLock = val;
            }
        }
    }
};
</script>
<style>
.hoverOp {
  display: flex;
  position: absolute;
  right: 10px;
  top: 0px;
  height: 100%;
}
</style>
