import Vue from 'vue';
import VueResource from 'vue-resource';
import VueCookie from 'vue-cookie';

import objectUtil from '../util/objectUtil';

Vue.use(VueResource);
Vue.use(VueCookie);

export default {
    pasteImage(event, isUpload, img) {
        let t = this;
        let promise = new Promise(function(resolve, reject) {
            let data = event.clipboardData;
            if (data && data.items && data.items.length > 0) {
                for (let i = 0; i < data.items.length; i++) {
                    let item = data.items[i];
                    if (item.kind === 'file') {
                        let blob = item.getAsFile();
                        if (blob.size > 0) {
                            // 判断是否需要上传
                            if (isUpload) {
                                t.uploadImage(blob).then(response => {
                                    let file = objectUtil.isArray(response) ? response[0] : response;
                                    file = objectUtil.cloneFields(file, ['name', 'fileSize', 'path', 'src'],
                                        ['name', 'size', 'path', 'thumbnail']);
                                    if (img) {
                                        img.src = file.path;
                                    }
                                    // 返回上传后的文件信息
                                    resolve(file);
                                }, response => {
                                    response;
                                    reject('upload fail');
                                });
                            } else {
                                let reader = new FileReader();
                                reader.onload = function(e) {
                                    // e.target.result为图片的Base64编码字符串
                                    if (img) {
                                        img.src = e.target.result;
                                    }
                                    resolve(e.target.result);
                                };
                                reader.readAsDataURL(blob);
                            }
                            return;
                        }
                    }
                }
                reject('no image');
            } else {
                reject('no image');
            }
        });
        return promise;
    },

    uploadImage(imgFile) {
        let promise = new Promise(function(resolve, reject) {
            let data = new FormData();
            data.append('file', imgFile);
            Vue.http.post('/rest/upload/image', data, { headers: { token: Vue.cookie.get('token') } }).then(response => {
                resolve(response.body);
            }, response => {
                reject(response);
            });
        });
        return promise;
    }
};
