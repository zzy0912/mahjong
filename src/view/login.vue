<style>

.login-page {
    width: 100%;
    height: 100%;
    background: linear-gradient( #6D86C6, #52689F);
}
.img-position {
    position: absolute;
    top: 10.5%;
    left: 13.8%;
    width: 35.58%;
    height: 68.7%;
}
.login-title {
    height: 55px;
    line-height: 55px;
    color: #52689F;;
    text-align: center;
    font-weight: 700;
    font-size: 20px;
    margin-bottom:20px;
}
.line {
    width: 85px;
    height: 27px;
    border-bottom: 1px solid #ccc;
}
.login-input input {
    height: 40px;
    padding-right: 35px;
    padding-left: 40px;
}
.login-input i {
    color: #909090;
    font-size: 20px;
    position: absolute;
    z-index: 99;
    top: 0;
}
.login-btn {
    background: #52689F;
    width: 100%;
    margin-top: 30px;
    font-size: 16px;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    color: #fff;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    transition: .1s;
    font-weight: 500;
    padding: 12px 20px;
    border-radius: 4px;
}
.login-btn:hover {
    background: #6D86C6;
}
.forgot-pwd {
    width: 100%;
    height: 45px;
    text-align: right;
    color: #C0C4CC;
    font-size: 14px;
    display: block;
    line-height: 45px;
    margin-bottom: 10px;
    cursor: pointer;
}

</style>

<template>
<div class="login-page">
    <div class="img-position">
        <img src="../assets/1.png" style="width:50%;"/>
        <img src="../assets/2.png" style="width:100%;position:absolute;bottom:0;left:0;"/>
    </div>
    <div style="width: 315px;position: absolute;bottom: 20.8%;right: 10%;background: #fff;border-radius: 5px;box-sizing: border-box;padding: 20px;">
        <h1 class="login-title"><span class="line" style="float:left;"></span>登录<span class="line" style="float:right;"></span></h1>
        <el-form ref="info" :model="info" :rules="rules" class="login-input">
            <el-form-item prop="account">
                <!-- <el-input
                    prefix-icon="iconfont icon-user"
                    v-model="info.account" class="login-input" @keyup.enter.native="pswFocus" placeholder="请输入账号">
                </el-input> -->
                <i class="iconfont icon-user" style="left:13px;"></i>
                <el-input v-model="info.account" @keyup.enter.native="pswFocus" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <i class="iconfont icon-lock" style="left:13px;"></i>
                <el-input :type="pswLock?'password':'text'" ref="pswInput" v-model="info.password" @keyup.enter.native="login" placeholder="请输入密码"></el-input>
                <i class="iconfont" :class="pswLock?'icon-eye-close':'icon-eye-open'" @click="showPsw" style="right:13px;"></i>
            </el-form-item>
        </el-form>
        <div class="login-btn" @click="login">登录</div>
        <span class="forgot-pwd" @click="dialogFormVisible = true">忘记密码？</span>
    </div>
    <el-dialog title="找回密码" :visible.sync="dialogFormVisible">
    <el-form ref="findPsd" :model="form" :rules="rules2" label-width="80px">
        <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
        <el-input v-model="form.code" style="padding-right:50px;"></el-input>
        <span :style="`position: absolute;z-index: 99;top: 0;right:13px;${allowGetCode?'cursor:pointer;':'color:#909090'};`" @click="getVrCode">{{codeTit}}</span>
        </el-form-item>
        <el-form-item label="密码" prop="password">
            <el-input :type="pswLock2?'password':'text'" v-model="form.password" placeholder="请输入密码"></el-input>
            <i style="position: absolute;z-index: 99;top: 0;right:13px;" class="iconfont" :class="pswLock2?'icon-eye-close':'icon-eye-open'" @click="showPsw2"></i>
        </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
    </el-dialog>
</div>
</template>
<script>
import Vue from 'vue';
import VueResource from 'vue-resource';
import VueCookie from 'vue-cookie';
import { MessageBox } from 'element-ui';
Vue.use(VueResource);
Vue.use(VueCookie);
export default {
	name: 'login',
    data() {
        var checkphoneNum = (rule, value, callback) => {
            if (value) {
                value = value.replace(/(^\s*)|(\s*$)/g, '');
                if (!(/^1[3|4|5|7|8]\d{9}$/.test(value))) {
                    callback(new Error('请输入正确的电话号码！'));
                } else {
                    callback();
                }
            } else {
                callback(new Error('请先输入电话号码'));
            }
        };
        return {
            pswLock: true,
            pswLock2: true,
            allowGetCode: true,
            codeTit: '获取验证码',
            dialogFormVisible: false,
            form: {},
            rules2: {
                phone: [{
                    validator: checkphoneNum,
                    required: true,
                    trigger: 'blur'
                }],
                code: [{
                    required: true,
                    message: '请输入验证码',
                    trigger: 'blur'
                }],
                password: [{
                    required: true,
                    message: '请输入密码',
                    trigger: 'blur'
                }]
            },
            info: {
                account: null,
                password: null
                // saveToken: false
            },
            rules: {
                account: [{
                    required: true,
                    message: '请输入账户',
                    trigger: 'blur'
                }],
                password: [{
                    required: true,
                    message: '请输入密码',
                    trigger: 'blur'
                }]
            }
        };
    },
    methods: {
        pswFocus: function() {
            this.$refs.pswInput.focus();
        },
        login: function() {
            this.$refs.info.validate(valid => {
                if (valid) {
                    this._login();
                } else {
                    MessageBox.alert('输入错误', '错误', {
                        type: 'error',
                        confirmButtonText: '确定'
                    });
                    return false;
                }
            });
        },

        _login: function() {
            let para = {
                account: this.info.account,
                password: this.info.password
            };
            // this.$cue.remoteService.call('auth', 'login', para).then((response) => {
            //     this._handleLoginResult(response);
            // }, (xhr) => {
            //     if (xhr.status === 401) {
            //         MessageBox.alert('账号或者密码错误', '错误', {
            //             type: 'error',
            //             confirmButtonText: '确定'
            //         });
            //     } else {
            //         let msg_label = '登录连接失败';
            //         let msg_type = '错误';
            //         let msg_para = {
            //             type: 'error',
            //             confirmButtonText: '确定'
            //         };
            //         MessageBox.alert(msg_label, msg_type, msg_para);
            //     }
            // });
            Vue.http.post('/rest/auth/login', JSON.stringify(para)).then((response) => {
                this._handleLoginResult(response);
            }, (xhr) => {
                if (xhr.status === 401) {
                    MessageBox.alert('账号或者密码错误', '错误', {
                        type: 'error',
                        confirmButtonText: '确定'
                    });
                } else {
                    let msgLabel = '登录连接失败';
                    let msgType = '错误';
                    let msgPara = {
                        type: 'error',
                        confirmButtonText: '确定'
                    };
                    MessageBox.alert(msgLabel, msgType, msgPara);
                }
            });
        },

        _handleLoginResult: function(response) {
            let data = response.data;
            // 检查是否登录成功
            if (data.hasOwnProperty('__exception')) {
                MessageBox.alert('账号或者密码错误', '错误', {
                    type: 'error',
                    confirmButtonText: '确定'
                });
            } else {
                let cookieOpt = {
                    path: '/'
                };
                Vue.cookie.set('token', data.token, cookieOpt);
                Vue.cookie.set('id', data.id, cookieOpt);
                Vue.cookie.set('account', data.account, cookieOpt);
                let redirect;
                let url = window.location.href; // 获取url
                let pos = url.indexOf('#');
                if (pos >= 0) {
                    url = url.substr(pos + 1);
                    var paras = url.split('&');
                    for (var i = 0; i < paras.length; i++) {
                        var paraParts = paras[i].split('=');
                        if (paraParts[0] === 'redirect') {
                            redirect = paraParts[1];
                            break;
                        }
                    }
                }
                console.log(redirect);
                if (redirect) {
                    redirect = decodeURIComponent(redirect);
                } else {
                    redirect = '/#/home';
                }
                Vue.http.post('/rest/model/getEntities', JSON.stringify({
                    target: 'orgRoleUser',
                    filter: {
                        relation: 'AND',
                        children: [{
                            field: 'user.account',
                            match: 'EQ',
                            value: data.account
                        }, {
                            field: 'role',
                            match: 'EQ',
                            value: 'manager'
                        }]
                    },
                    retFields: ['user', {name: 'org', retFields: ['type']}, {name: 'role', retFields: ['name']}]
                })).then((res) => {
                    res = res.data;
                    if (res.list.length === 0) {
                        Vue.cookie.set('token', null, { path: '/', expires: 0 });
                        Vue.cookie.set('orgId', null, { path: '/', expires: 0 });
                        Vue.cookie.set('orgType', null, { path: '/', expires: 0 });
                        MessageBox.alert('账号异常，有问题请联系管理员', '错误', {
                            type: 'error',
                            confirmButtonText: '确定'
                        });
                        return;
                    }
                    this.managerOrg = res.list[0].org;
                    for (let i = 1; i < res.list.length; i++) {
                        if (res.list[i].org.type.id < this.managerOrg.type.id) {
                            this.managerOrg = res.list[i].org;
                        }
                    }
                    Vue.cookie.set('orgId', this.managerOrg.id, cookieOpt);
                    Vue.cookie.set('orgType', this.managerOrg.type.id, cookieOpt);
                    console.log(redirect);
                    window.location = redirect;
                }, () => {
                    MessageBox.alert('账号异常，有问题请联系管理员', '错误', {
                        type: 'error',
                        confirmButtonText: '确定'
                    });
                });
            }
        },
        showPsw: function() {
            this.pswLock = !this.pswLock;
        },
        showPsw2: function() {
            this.pswLock2 = !this.pswLock2;
        },
        checkphoneNum: function() {
            if (this.form.phone) {
                this.form.phone = this.form.phone.replace(/(^\s*)|(\s*$)/g, '');
            } else {
                MessageBox.alert('请先输入电话号码！', '错误', {
                    type: 'error',
                    confirmButtonText: '确定'
                });
                return false;
            }
            if (!(/^1[3|4|5|7|8]\d{9}$/.test(this.form.phone))) {
                MessageBox.alert('请输入正确的电话号码！', '错误', {
                    type: 'error',
                    confirmButtonText: '确定'
                });
                return false;
            }
            return true;
        },
        getVrCode: function() {
            if (!this.checkphoneNum() || !this.allowGetCode) {
                return;
            }
            this.allowGetCode = false;
            Vue.http.post('/rest/webUser/sendVerifyCode', JSON.stringify({phone: this.form.phone}));
            // this.$cue.remoteService.call('webUser', 'sendVerifyCode', {
            //     phone: this.form.phone
            // });
            var time = 60;
            this.codeTit = '重新获取(' + time + 's)';
            var interval = setInterval(() => {
                time--;
                this.codeTit = '重新获取(' + time + 's)';
                if (time <= 0) {
                    this.codeTit = '获取验证码';
                    this.allowGetCode = true;
                    clearInterval(interval);
                }
            }, 1000);
        },
        submitForm: function() {
            this.$refs.findPsd.validate(valid => {
                if (valid) {
                    // this.$cue.remoteService.call('webUser', 'forgetPassword', {
                    //     phone: this.form.phone,
                    //     newPassword: this.form.password,
                    //     code: this.form.code
                    // }).then(() => {
                    //     this.$message({
                    //         message: '操作成功！',
                    //         type: 'success'
                    //     });
                    // });
                    Vue.http.post('/rest/webUser/forgetPassword', JSON.stringify({
                        phone: this.form.phone,
                        newPassword: this.form.password,
                        code: this.form.code
                    })).then(() => {
                        this.dialogFormVisible = true;
                        this.$message({
                            message: '操作成功！',
                            type: 'success'
                        });
                    }, (xhr) => {
                        MessageBox.alert(xhr.data.__exception.message, '错误', {
                            type: 'error',
                            confirmButtonText: '确定'
                        });
                    });
                } else {
                    MessageBox.alert('输入错误', '错误', {
                        type: 'error',
                        confirmButtonText: '确定'
                    });
                    return false;
                }
            });
        },
        onPasswordChange: function(value) {
            if (value) {
                let count = 0;
                for (var i = 0; i < value.length; i++) {
                    if (value[i] === '*') {
                        count++;
                    } else {
                        break;
                    }
                }
                if (!this._hidePassword) {
                    this._hidePassword = '';
                }
                this._hidePassword = this._hidePassword.substring(0, count) + value.substring(count);
                this.$set(this.info, 'password', '*'.repeat(value.length));
            } else {
                this._hidePassword = '';
            }
        }
    }
};

</script>
