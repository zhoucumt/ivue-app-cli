const download = require('download-git-repo');
const request = require('./request');
const {orgName} = require('../../config');

class git {
    constructor() {
        this.orgName = orgName;
    }

    /**
     * 获取项目组中的项目模板列表
     *
     */
    getProjectList() {
        return request(`/orgs/${this.orgName}/repos`);
    }

    /**
     * 获取项目模板的版本列表
     * @param {String} repo 项目名称
     *
     */
    getProjectVersions(repo) {
        return request(`/repos/${this.orgName}/${repo}/tags`);
    }

    /**
     * 下载 github 项目
     * @param {Object} param 项目信息 项目名称 项目版本 本地开发目录
     *
     */
    downloadProject({repo, version, repoPath}) {
        return new Promise((resolve, reject) => {
            // ivue-app-cli/ivue-app#v0.1.0
            download(`${this.orgName}/${repo}#${version}`, repoPath, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }
}

module.exports = git;
