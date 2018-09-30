let fs = require('fs');
let path = require('path');
let chokidar = require('chokidar');
let fsUtil = require('./fsUtil');
let extendVue = require('./extendVue');
let defService = require('./defService');
let csharp = require('./csharp');

const SRC_PATH = path.join(__dirname, '..' + path.sep + '..' + path.sep);
const DEF_PATH = path.join(__dirname, '..' + path.sep + '..' + path.sep + '..' + path.sep + 'definition');
const IGNORE_DIRS = [ 'common', 'definition' ];

function getExistedFiles(folder, ret)
{
    if (!ret) {
        ret = {};
    }
    let files = fs.readdirSync(folder);
    let t = this;
    files.forEach(file => {
        let cur_path = path.join(folder, file);
        ret[cur_path] = true;
        if (fs.statSync(cur_path).isDirectory()) {
            getExistedFiles(cur_path, ret);
        }
    });
    return ret;
}

// 处理文件夹
function handleFolder(src, dst)
{
    // 注意：如果dst不存在，建立文件夹，否则后面的copyFile会失败。
    if (!fs.existsSync(dst)) {
        fsUtil.mkdir(dst);
    }
    let files = fs.readdirSync(src);
    files.forEach(file => {
        let src_path = path.join(src, file);
        let dst_path = path.join(dst, file);
        let info = fs.statSync(src_path);
        if (info.isDirectory()) {
            // 递归处理目录
            handleFolder(src_path, dst_path);
        } else if (path.extname(file) === ".vue") {
            // 处理vue文件（注意模板文件不需要处理）
            if (file.indexOf(".tmpl.") < 0) {
                extendVue.extendVueFile(src_path, dst_path);
            }
        } else if (file === 'mould.json') {
            // 处理mould文件
            extendVue.extendMouldFile(src_path, src, dst);
        } else {
            // 其他文件直接复制
            fsUtil.copyFile(src_path, dst_path);
        }
    });
}

// 返回path对应的vue_dist路径
function getSrcVueDistPath(vuePath) {
    // 找到相对路径
    let rel_path = vuePath.substring(SRC_PATH.length);
    // 分解第一段和第二段
    let pos1 = rel_path.indexOf(path.sep);
    if (pos1 < 0) {
        return null;
    }
    let pos2 = rel_path.indexOf(path.sep, pos1 + 1);
    if (pos2 < 0) {
        return null;
    }
    // 检查第二段是否为vue
    if (rel_path.substring(pos1 + 1, pos2) !== 'vue') {
        return null;
    }
    // 检查第一段是否要忽略
    let first_part = rel_path.substring(0, pos1);
    if (IGNORE_DIRS.indexOf(first_part) >= 0) {
        return null;
    }
    // 判断是否临时文件
    if (rel_path.indexOf('_tmp_') >= 0) {
        return null;
    }
    // 返回对应的vue_dist路径
    return path.join(SRC_PATH, first_part + path.sep + 'vue_dist' + rel_path.substring(pos2));
}

function watchSrcChange_addDir(srcPath, dstPath) {
    // 在vue_dist下创建目录
    console.log('qbuild watch: addDir ' + srcPath);
    if (!fs.existsSync(dstPath)) {
        fsUtil.mkdir(dstPath);
    }
}

function watchSrcChange_unlinkDir(srcPath, dstPath) {
    // 在vue_dist下删除目录
    console.log('qbuild watch: unlinkDir ' + srcPath);
    if (fs.existsSync(dstPath)) {
        fsUtil.deleteFolder(dstPath);
    }
}

function watchSrcChange_addOrChange(srcPath, dstPath) {
    let file = path.basename(dstPath);
    // 判断是否vue文件
    if (path.extname(file) === ".vue") {
        // 判断是否模板文件
        if (file.indexOf(".tmpl.") >= 0) {
            // 找到src下所有引用的mould.json，????
        } else {
            // 处理vue文件
            extendVue.extendVueFile(srcPath, dstPath);
        }
    } else if (file === 'mould.json') {
        // 处理mould文件
        extendVue.extendMouldFile(srcPath, path.dirname(srcPath), path.dirname(dstPath));
    } else {
        // 其他文件直接复制
        fsUtil.copyFile(srcPath, dstPath);
    }
}

function watchSrcChange_add(srcPath, dstPath) {
    console.log('qbuild watch: add ' + srcPath);
    watchSrcChange_addOrChange(srcPath, dstPath);
}

function watchSrcChange_change(srcPath, dstPath) {
    console.log('qbuild watch: change ' + srcPath);
    watchSrcChange_addOrChange(srcPath, dstPath);
}

function watchSrcChange_unlink(srcPath, dstPath) {
    console.log('qbuild watch: unlink ' + srcPath);
    let file = path.basename(dstPath);
    // 判断是否vue文件
    if (path.extname(file) === ".vue") {
        // 判断是否模板文件。非模板文件直接删除
        if (file.indexOf(".tmpl.") < 0) {
            fsUtil.deleteFile(dstPath);
        }
    } else if (file === 'mould.json') {
        // 删除mould.json中生成的文件????
    } else {
        // 其他文件，直接删除
        fsUtil.deleteFile(dstPath);
    }
}

const WATCH_SRC_CHANGE = { addDir: watchSrcChange_addDir, unlinkDir: watchSrcChange_unlinkDir,
    add: watchSrcChange_add, change: watchSrcChange_change, unlink: watchSrcChange_unlink
};

function watchDefChange_change(srcPath) {
    console.log('qbuild watch: change ' + srcPath);
    watchDefChange_changeOrUnlink(srcPath);
}

function watchDefChange_unlink(srcPath) {
    console.log('qbuild watch: unlink ' + srcPath);
    watchDefChange_changeOrUnlink(srcPath);
}

function watchDefChange_changeOrUnlink(srcPath) {
    // 检查是否模型的定义
    if (srcPath.indexOf(path.sep + 'definition' + path.sep + 'model' + path.sep) >= 0) {
        // 获取模型名字
        let pos = srcPath.lastIndexOf(path.sep);
        if (pos >= 0) {
            let model = srcPath.substring(pos + 1);
            pos = model.indexOf('.');
            if (pos >= 0) {
                model = model.substring(0, pos);
                defService.clearModelDefCache(model);
            }
        }
    }
}

const WATCH_DEF_CHANGE = { change: watchDefChange_change, unlink: watchDefChange_unlink };

let build = {
    build() {
        // 扫描src下所有的文件夹
        let folders = fs.readdirSync(SRC_PATH);
        folders.forEach(function(folder) {
            // 判断文件夹是否要忽略
            if (IGNORE_DIRS.indexOf(folder) < 0) {
                let src_path = path.join(SRC_PATH, folder + path.sep + 'vue');
                if (fs.existsSync(src_path)) {
                    let dst_path = path.join(SRC_PATH, folder + path.sep + 'vue_dist');
                    // 清空文件夹
                    // fsUtil.deleteFolder(dst_path);
                    // 处理文件夹
                    handleFolder(src_path, dst_path);
                }
            }
        });
    },
    buildFile(srcPath) {
        let dst_path = getSrcVueDistPath(srcPath);
        if (dst_path) {
            let file = path.basename(dst_path);
            // 判断是否vue文件
            if (path.extname(file) === ".vue") {
                // 判断是否模板文件
                if (file.indexOf(".tmpl.") < 0) {
                    // 处理vue文件
                    extendVue.extendVueFile(srcPath, dst_path);
                }
            } else if (file === 'mould.json') {
                // 处理mould文件
                extendVue.extendMouldFile(srcPath, path.dirname(srcPath), path.dirname(dst_path));
            }
        }
    },
    watch() {
        let src_watcher = chokidar.watch(SRC_PATH);
        // 启动时，扫描已经存在的文件
        let src_start_files = getExistedFiles(SRC_PATH);
        Object.keys(WATCH_SRC_CHANGE).forEach(event => {
            src_watcher.on(event, changePath => {
                // 启动时已经存在的文件，在启动时不处理
                if (event === 'addDir' || event === 'add') {
                    if (src_start_files[changePath]) {
                        delete src_start_files[changePath];
                        return;
                    }
                }
                let dist_path = getSrcVueDistPath(changePath);
                if (dist_path) {
                    WATCH_SRC_CHANGE[event](changePath, dist_path);
                } else if (event === 'change' || event === 'unlink') {
                    // 处理定义中的模型文件
                    watchDefChange_changeOrUnlink(changePath);
                }
            });
        });
        if (fs.existsSync(DEF_PATH)) {
            let def_watcher = chokidar.watch(DEF_PATH);
            // 启动时，扫描已经存在的文件
            let def_start_files = getExistedFiles(DEF_PATH);
            Object.keys(WATCH_DEF_CHANGE).forEach(event => {
                def_watcher.on(event, changePath => {
                    // 启动时已经存在的文件，在启动时不处理
                    if (event === 'addDir' || event === 'add') {
                        if (def_start_files[changePath]) {
                            delete def_start_files[changePath];
                            return;
                        }
                    }
                    WATCH_DEF_CHANGE[event](changePath);
                });
            });
        }
    },
    updateCSharpProj() {
        csharp.updateProj();
    }
};

module.exports = build;
