// 命令管理
const commander = require('commander');
// 命令行交互工具
const inquirer = require('inquirer');
// 命令行中显示加载中
const ora = require('ora');
const Git = require('../tools/git');

class Download {
    constructor() {
        this.git = new Git();
        this.commander = commander;
        this.inquirer = inquirer;
        this.getProList = ora('getting project lists...');
        this.getTagList = ora('getting project tags info...');
        this.downLoad = ora('downloading template from github...');
    }

    run() {
        this.commander
            .command('init')
            .description('starting...')
            .action(() => {
                this.download();
            });

        this.commander.parse(process.argv);
    }

    async download() {
        let getProListLoad;
        let getTagListLoad;
        let downLoadLoad;
        let repos;
        let version;

        // 获取所在项目组的所有可开发项目列表
        try {
            getProListLoad = this.getProList.start();
            repos = await this.git.getProjectList();
            getProListLoad.succeed('got project lists succeed!');
        }
        catch (error) {
            console.log(error);
            getProListLoad.fail('got project lists failed...');
            process.exit(-1);
        }

        // 如果没有项目可以下载，则给出提示
        if (repos.length === 0) {
            console.log('\nthere is no templates,please check it!~~\n'.red);
            process.exit(-1);
        }

        const choices = repos.map(({name}) => name);
        const questions = [
            {
                type: 'list',
                name: 'repo',
                message: 'Please pick a project type:',
                choices
            }
        ];

        const {repo} = await this.inquirer.prompt(questions);

        // 获取项目的版本, 这里默认选择确定项目的最近一个版本
        try {
            getTagListLoad = this.getTagList.start();
            [{name: version}] = await this.git.getProjectVersions(repo);
            getTagListLoad.succeed('getting tags info succeed!');
        }
        catch (error) {
            console.log(error);
            getTagListLoad.fail('getting tags info failed!');
            process.exit(-1);
        }

        // 向用户咨询欲创建项目的目录
        const repoName = [
            {
                type: 'input',
                name: 'repoPath',
                message: 'Please input a project name~',
                validate(v) {
                    const done = this.async();
                    if (!v.trim()) {
                        done('project name cannot be empty~');
                    }
                    done(null, true);
                }
            }
        ];
        const {repoPath} = await this.inquirer.prompt(repoName);

        // 下载代码到指定的目录下
        try {
            downLoadLoad = this.downLoad.start();
            await this.git.downloadProject({repo, version, repoPath});
            downLoadLoad.succeed('downloading code succeed');
        }
        catch (error) {
            console.log(error);
            downLoadLoad.fail('downloading code failed...');
        }
    }
}

const init = new Download();
init.run();
