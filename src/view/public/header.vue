<style>
    .userInfo {
        float:right;
        position: relative;
        margin-right:20px;
        line-height: 78px;
        font-size:18px;
    }
    .userInfo span {
        cursor: pointer;
    }
    .userInfo i {
        /* position: absolute; */
        float: left;
        width:30px;
        font-size: 25px;
    }
    .isShowPsw:hover .upPsw {
        display: block;
    }
    .upPsw {
        display: none;
        position: absolute;
        top: 30px;
        left: 75px;
    }
</style>
<template>
<div>
    <div :style="`margin-left:${showWidth}px;`">
        <div class="header main-bg">
            <div class="header left" style="width:67px;background:#fff;" v-show="showWidth===0">
                <img id="logoSmall" :src="logoSmall" style="margin:15px 0 0 10px;width:80%;"/>
            </div>
            <div class="iconfont icon-menu left" style="margin: 28px 0 0 15px;font-size:18px;cursor:pointer;" @click="handleShowMenu"></div>
            <div class="userInfo">
                <div class="left">
                    <i class="iconfont icon-user"></i>
                    欢迎您：
                    <span class="isShowPsw">
                        {{user.label}}!
                        <div class="upPsw"><el-button @click="dialogFormVisible=true">修改密码</el-button></div>
                    </span>
                </div>
                <div class="left" style="margin-left:25px;" @click="logout"><i class="iconfont icon-quit"></i><span>退出</span></div>
            </div>
        </div>
    </div>
    <el-dialog title="修改密码" :visible.sync="dialogFormVisible">
    <el-form :model="form" label-width="80px">
        <el-form-item label="旧密码">
        <el-input v-model="form.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
            <el-input :type="pswLock?'password':'text'" v-model="form.newPassword" placeholder="请输入密码"></el-input>
            <i style="position: absolute;z-index: 99;top: 0;right:13px;" class="iconfont" :class="pswLock?'icon-eye-close':'icon-eye-open'" @click="showPsw"></i>
        </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="upPsw">确 定</el-button>
    </div>
    </el-dialog>
</div>
</template>
<script>
export default {
    name: 'mahjong-header',
    data() {
        return {
            showWidth: 220,
            logo: '../../static/logo.png',
            logoSmall: '../../static/logo-small.png',
            user: {label: 'admin'},
            dialogFormVisible: false,
            pswLock: true,
            form: {}
        };
    },
    mounted() {
    },
    methods: {
        showPsw: function() {
            this.pswLock = !this.pswLock;
        },
        upPsw: function() {
            if (!this.form.oldPassword || !this.form.newPassword) {
                this.$cue.uiService.showAlert('请先输入完整！', 'error', '提示');
                return false;
            }
            this.$cue.remoteService.call('user', 'updatePassword', {
                id: this.user.id,
                oldPassword: this.form.oldPassword,
                newPassword: this.form.newPassword
            }).then(() => {
                this.dialogFormVisible = false;
                this.$message({
                    message: '操作成功！',
                    type: 'success'
                });
            });
        },
        handleShowMenu: function() {
            if (this.showWidth === 220) {
                this.showWidth = 0;
            } else {
                this.showWidth = 220;
            }
        },
        logout: function() {
            this.$cue.remoteService.logout();
        }
    }
};

</script>
