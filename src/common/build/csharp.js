/**
 * Created by MyPC on 2017/12/8.
 */
let fs = require('fs');
let path = require('path');
let htmlparser2 = require('htmlparser2');
let dom_serialize = require('dom-serializer');
let domUtil = require('./domUtil');

const FE_PATH = path.join(__dirname, '..' + path.sep + '..' + path.sep + '..' + path.sep);
const DIST_PATH = path.join(FE_PATH, 'dist');
const PROJ_PATH = path.join(FE_PATH, '..' + path.sep);
const DIST_REL_PATH = 'fe' + path.sep + 'dist' + path.sep;
const XML_PARSE_OPTS = { lowerCaseTags: false, lowerCaseAttributeNames: false, recognizeSelfClosing: true };

function addResources(itemGroup, absPath, relPath) {
    let files = fs.readdirSync(absPath);
    files.forEach(function(file) {
        let cur_path = path.join(absPath, file);
        if (fs.statSync(cur_path).isFile()) {
            htmlparser2.DomUtils.appendChild(itemGroup, domUtil.createTextEle('\r\n    '));
            let embeded_res = domUtil.createTagEle('EmbeddedResource', { Include: relPath + file });
            htmlparser2.DomUtils.appendChild(itemGroup, embeded_res);
        } else {
            addResources(itemGroup, path.join(absPath, file), relPath + file + path.sep);
        }
    });
}

function isEleEmpty(ele) {
    if (ele.children && ele.children.length > 0) {
        for (let i = 0; i < ele.children.length; i++) {
            let child = ele.children[i];
            if (child.type === 'text') {
                for (let j = 0; j < child.data.length; j++) {
                    let c = child.data[j];
                    if (c !== '\r' && c !== '\n' && c !== ' ') {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }
    }
    return true;
}

let csharp = {
    updateProj(folder) {
        // 确定目录
        if (!folder) {
            folder = PROJ_PATH;
        }
        // 目录下找到项目文件
        let files = fs.readdirSync(folder);
        let t = this;
        let proj_file;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (path.extname(file).toLowerCase() === '.csproj') {
                let cur_path = path.join(folder, file);
                if (fs.statSync(cur_path).isFile()) {
                    proj_file = cur_path;
                    break;
                }
            }
        }
        if (proj_file) {
            // 读入文件
            let file_content = fs.readFileSync(proj_file, 'utf8');
            let file_eles = htmlparser2.parseDOM(file_content, XML_PARSE_OPTS);
            let proj_ele = domUtil.getElesByName(file_eles, 'Project');
            if (proj_ele.length > 0) {
                proj_ele = proj_ele[0];
            } else {
                return;
            }
            // 遍历所有的ItemGroup
            let item_groups = domUtil.getElesByName(proj_ele.children, 'ItemGroup');
            let insert_item_group;
            item_groups.forEach(function(itemGroup) {
                // 遍历所有的EmbeddedResource
                let embedded_reses = domUtil.getElesByName(itemGroup.children, 'EmbeddedResource');
                embedded_reses.forEach(function(res) {
                    if (htmlparser2.DomUtils.getAttributeValue(res, 'Include').indexOf(DIST_REL_PATH) === 0) {
                        // 删除该资源
                        htmlparser2.DomUtils.removeElement(res);
                    }
                });
                if (isEleEmpty(itemGroup)) {
                    if (insert_item_group) {
                        htmlparser2.DomUtils.removeElement(itemGroup);
                    } else {
                        insert_item_group = itemGroup;
                        itemGroup.children = [];
                    }
                }
            });
            if (!insert_item_group) {
                insert_item_group = domUtil.createTagEle('ItemGroup');
                domUtil.append(item_groups[item_groups.length - 1], [ domUtil.createTextEle('\r\n  '), insert_item_group ]);
            }
            // 添加资源
            addResources(insert_item_group, DIST_PATH, DIST_REL_PATH);
            // 添加换行
            htmlparser2.DomUtils.appendChild(insert_item_group, domUtil.createTextEle('\r\n  '));
            // 写入文件。xmlMode设置成true，对于无子的元素会按照自闭标签方式显示。
            file_content = dom_serialize(file_eles, { xmlMode: true });
            fs.writeFileSync(proj_file, file_content, 'utf8');
        }
    }
};

module.exports = csharp;