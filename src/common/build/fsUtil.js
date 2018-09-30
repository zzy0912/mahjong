let fs = require('fs');
let path = require('path');

let fsUtil = {
    // 删除文件夹：逐层删除，替代fs的rmdirSync(只能删除空文件夹)，保证先把文件夹内的文件删除了，再删除文件夹。
    deleteFolder(folder) {
        if (fs.existsSync(folder))
        {
            let files = fs.readdirSync(folder);
            let t = this;
            files.forEach(file => {
                let cur_path = folder + path.sep + file;
                if (fs.statSync(cur_path).isDirectory()) {
                    t.deleteFolder(cur_path);
                } else {
                    fs.unlinkSync(cur_path);
                }
            });
            fs.rmdirSync(folder);
        }
    },
    // 删除文件：安全删除，替代fs的unlinkSync，确认要删除的文件是否存在。
    deleteFile(file) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    },
    // 复制文件：由于未使用流+管道的复制方式，所以复制的文件不能太大。
    copyFile(src, dst) {
        // 注意：这里不能使用流+管道复制，管道复制是异步复制，也就是说copyFile返回后，dst并没有生成。
        let file_content = fs.readFileSync(src);
        fs.writeFileSync(dst, file_content);
    },
    // 新建文件夹：替代fs的mkdirSync(必须在父文件夹存在的情况下才能新建文件夹成功)，可以逐层建立文件夹
    mkdir(folder) {
        // 判断文件夹是否存在，如果存在，直接退出
        if (!fs.existsSync(folder)) {
            // 读取父文件夹
            let parent_folder = path.dirname(folder);
            // 确保父文件夹被建立
            this.mkdir(parent_folder);
            fs.mkdirSync(folder);
        }
    }
};

module.exports = fsUtil;
