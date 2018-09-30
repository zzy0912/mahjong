<style>
.upload-avatar {
    width: 145px;
    height: 145px;
    display: block;
}
</style>

<template>

<div>
    <el-upload action="/rest/upload" list-type="picture-card" :file-list='fileList' :on-success='onImgUploaded' :on-remove="handleRemove" :show-file-list="!!multiple">
        <img v-if="!multiple&&fileList.length" :src="imageUrl" class="upload-avatar">
        <i v-if="multiple||fileList.length<1" class="el-icon-plus"></i>
    </el-upload>
</div>

</template>

<script>

export default {
    name: 'q-uploader',
    props: ['model', 'selector', 'value', 'multiple'],
    data: function() {
        return {
            fileList: [],
            files: [],
            hasInited: false,
            imageUrl: undefined
        };
    },
    watch: {
        value: function(val) {
            if (!this.hasInited) {
                let list = JSON.parse(val) || [];
                this.files = list;
                for (let i = 0; i < list.length; i++) {
                    if (!list[i].url) {
                        list[i].url = this.$cue.uiService.getPrivateDownloadUrlOfFile(list[i].path);
                    }
                }
                this.fileList = list;
                if (!this.multiple) {
                    this.imageUrl = list[0].url;
                }
                this.hasInited = true;
            }
        }
    },
    methods: {
        onImgUploaded: function(res, file, fileList) {
            this.imageUrl = URL.createObjectURL(file.raw);
            let upload_file;
            if (this.multiple) {
                let length = fileList.length;
                fileList[length - 1].path = res.path;
                fileList[length - 1].src = res.src;
                upload_file = {
                    name: res.name,
                    path: res.path,
                    src: res.src
                };
                this.fileList = fileList;
                this.files.push(upload_file);
            } else {
                fileList = [{
                    path: res.path,
                    src: res.src
                }];
                upload_file = {
                    name: res.name,
                    path: res.path,
                    src: res.src
                };
                this.fileList = fileList;
                this.files = [upload_file];
            }
            this.$emit('input', JSON.stringify(this.files));
        },
        handleRemove(file, fileList) {
            this.files = [];
            for (let i = 0; i < fileList.length; i++) {
                this.files.push({
                    name: fileList[i].name,
                    path: fileList[i].path,
                    src: fileList[i].src
                });
            }
            this.$emit('input', JSON.stringify(this.files));
        }
    }
};

</script>
