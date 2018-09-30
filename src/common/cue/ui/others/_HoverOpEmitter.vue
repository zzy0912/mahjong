<script>
export default {
    props: [ 'hoverOpCategory' ],
    data() {
        return {
            isHoverOpShow: false,
            isHoverOpLock: false
        };
    },
    methods: {
        handleHoverOpOver(event) {
            if (this.isHoverOpLock) {
                return;
            }
            if (!this.isHoverOpShow && this.$cue.domUtil.isIn(event.currentTarget, event.clientX, event.clientY)) {
                this.isHoverOpShow = true;
                this.$emit('hover-op-over', this, event.currentTarget, this.hoverOpCategory);
            }
        },
        handleHoverOpOut(event) {
            if (this.isHoverOpLock) {
                return;
            }
            if (this.isHoverOpShow && !this.$cue.domUtil.isIn(event.currentTarget, event.clientX, event.clientY)) {
                this.isHoverOpShow = false;
                // 隐藏hover操作栏
                let hover_op = this.$cue.domUtil.findOne(this.$el, '.hoverOp');
                if (hover_op) {
                    hover_op.style.display = 'none';
                }
                this.$emit('hover-op-out', this, event.currentTarget, this.hoverOpCategory);
            }
        }
    }
};
</script>
