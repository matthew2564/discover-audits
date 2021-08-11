const shell = require('shelljs');

const path = '/Users/matt/personal/node/discover-audits'; // asbolute path
const org = 'dvsa'; //would be dvsa;
const repos = [
    'cvs-svc-test-results',
    'cvs-svc-defects',
    'cvs-svc-preparers',
];
const branch = 'develop';
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
        shell.exec(`git clone https://github.com/${org}/${repo} --progress`);
    } else {
        formatLog('Skipping clone stage');
    }
}
const gitActions = () => {
    shell.exec('git fetch');
    shell.exec(`git checkout ${branch}`);
    shell.exec(`git pull --rebase`);
}

// Navigate to appropriate directory
shell.cd(path);

// repos.forEach((repo) => {
for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    // clone repo
    cloneOrSkip(repo);

    // navigate into repo
    formatLog(`Navigating to ${repo}`);
    shell.cd(repo);

    // GIT actions
    formatLog(`Checking out branch ${branch}`);
    gitActions();

    // install dependencies
    formatLog(`Installing dependencies`);
    shell.exec('npm i --verbose');

    // count vulns
    let count = shell.exec(`npm audit --parseable | grep -E '(high|critical)' -c`);
    if (+count === 0) {
        formatLog('Ending early, no vulns detected');
        // go back to root
        shell.exec('cd');
        shell.cd(path);
        continue;
    }
    formatLog(`${count} vulnerabilites found`);

    // audit fix
    formatLog(`Running audit fix`);
    shell.exec('npm audit fix');

    // count vulns
    count = shell.exec(`npm audit --parseable | grep -E '(high|critical)' -c`);
    if (+count === 0) {
        // create PR
        formatLog(`Creating PR for ${branch} against ${repo} ******`);

    } else {
        reposToIntervene.push(repo);
        formatLog(`NOT ALL VULNS SORTED USING 'npm audit fix' for ${repo}`, 'error');
    }
    // go back to root
    shell.exec('cd');
    shell.cd(path);
};

console.log('reposToIntervene', reposToIntervene);
