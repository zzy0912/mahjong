/**
 * Created by MyPC on 2017/6/12.
 */

import { MessageBox } from 'element-ui';

function getDialogs(root, dialogs) {
    // 判断是否打开的模式对话框
    if (root.$options.name === 'ElDialog' && root.$props.modal && root.$props.visible) {
        dialogs.push(root);
    }
    if (root.$children) {
        root.$children.forEach(child => getDialogs(child, dialogs));
    }
}

export default {
    showAlert: function(msg, type, title) {
        if (!msg) {
            return;
        }
        if (!type) {
            type = 'info';
        }
        if (!title) {
            switch (type) {
                case 'success':
                    title = '成功';
                    break;
                case 'warning':
                    title = '警告';
                    break;
                case 'error':
                    title = '错误';
                    break;
                default :
                    title = '信息';
                    break;
            }
        }
        MessageBox.alert(msg, title, {
            type: type,
            confirmButtonText: '确定'
        });
    },
    getPublicDownloadUrlOfFile(filePath) {
        if (!filePath) {
            return '';
        }
        // 判断filePath是否完整地址
        if (filePath.indexOf('//') >= 0) {
            return filePath;
        }
        if (filePath[0] !== '/') {
            filePath = '/' + filePath;
        }
        return ('http://' + window.location.host + '/public' + filePath);
    },
    getPrivateDownloadUrlOfFile(filePath, disableResServer) {
        if (!filePath) {
            return '';
        }
        let serverUrl = (document.getElementsByTagName('meta')['resourceServer'] && !disableResServer) ? document.getElementsByTagName('meta')['resourceServer'].content : '';
        // 判断filePath是否完整地址
        if (filePath.indexOf('//') >= 0) {
            return filePath;
        }
        if (filePath[0] !== '/') {
            filePath = '/' + filePath;
        }
        return ((serverUrl || ('http://' + window.location.host)) + '/rest/upload/download?path=' + filePath);
    },
    getVodUrl(filePath) {
        if (!filePath) {
            return '';
        }
        let vodBaseUrl = document.getElementsByTagName('meta')['vodBaseUrl'] ? document.getElementsByTagName('meta')['vodBaseUrl'].content : '';
        // 判断filePath是否完整地址
        if (filePath.indexOf('//') >= 0) {
            return filePath;
        }
        if (filePath[0] !== '/') {
            filePath = '/' + filePath;
        }
        return ((vodBaseUrl || ('http://' + window.location.host)) + filePath);
    },
    closeDialogByGoBack(vm, next) {
        // 遍历所有vue控件，得到所有的el-dialog控件
        let dialogs = [];
        getDialogs(vm.$root, dialogs);
        if (dialogs.length > 0) {
            // 找到最上层的dialog
            let upper_dlg;
            dialogs.forEach(dialog => {
                if (!upper_dlg || parseInt(upper_dlg.$el.style.zIndex, 10) < parseInt(dialog.$el.style.zIndex, 10)) {
                    upper_dlg = dialog;
                }
            });
            upper_dlg.handleClose();
            next(false);
        } else {
            next();
        }
    }
};
