const shell = require('shelljs');
require('dotenv').config();

const reposToIntervene = [];
let skipClone = false;

const formatLog = (log, level = 'log') => console[level](`****** ${log} ******`);

const cloneOrSkip = (repo) => {
    if (!skipClone) {
        // remove repo if exists
        formatLog(`Removing ${repo} if exists`);
        shell.exec(`rm -rf ${repo}`);
        // clone repo
        formatLog(`Cloning fresh copy of ${repo}`);
        shell.exec(`git clone https://github.com/${process.env.ORG}/${repo} --progress`);
    } else {
        formatLog('Skipping clone stage');
    }
}
const gitActions = () => {
    shell.exec('git fetch');
    shell.exec(`git checkout ${process.env.BRANCH}`);
    shell.exec(`git pull --rebase`);
}

const startNextRepo = () => {
    // go back to root
    shell.exec('cd');
    shell.cd(process.env.FILE_PATH);
}

// Navigate to appropriate directory
shell.cd(process.env.FILE_PATH);

for (let i = 0; i < JSON.parse(process.env.REPOS).length; i++) {
    const repo = JSON.parse(process.env.REPOS)[i];
    // clone repo
    cloneOrSkip(repo);

    // navigate into repo
    formatLog(`Navigating to ${repo}`);
    shell.cd(repo);

    // GIT actions
    formatLog(`Checking out branch ${process.env.BRANCH}`);
    gitActions();

    // install dependencies
    formatLog(`Installing dependencies`);
    shell.exec('npm i --verbose');

    // count vulns
    let count = shell.exec(`npm audit --parseable | grep -E '(high|critical)' -c`);
    if (+count === 0) {
        formatLog('Ending early, no vulns detected');
        startNextRepo();
        continue;
    }
    formatLog(`${count} vulnerabilites found`);

    // audit fix
    formatLog(`Running audit fix`);
    shell.exec('npm audit fix');

    // count vulns after audit fix
    count = shell.exec(`npm audit --parseable | grep -E '(high|critical)' -c`);
    if (+count === 0) {
        // create PR
        formatLog(`Creating PR for ${process.env.BRANCH} against ${repo} ******`);

    } else {
        reposToIntervene.push(repo);
        formatLog(`NOT ALL VULNS SORTED USING 'npm audit fix' for ${repo}`, 'error');
    }

    startNextRepo();
};

console.log('reposToIntervene', reposToIntervene);
