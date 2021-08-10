const shell = require('shelljs');

const path = '/Users/matt/personal/node/discover-audits'; // asbolute path
const org = 'dvsa'; //would be dvsa;
const repos = [
    // 'auth-connect-desktop',
    'cvs-svc-test-results',
];
const branch = 'develop';
const reposToIntervene = [];
let skipClone = true;

const formatCount = (count) => (typeof count === 'string') ? Number(count.replace(/[^0-9]/g, '')) : 0;
const formatLog = (log, level = 'log') => console[level](`****** ${log} ******`);
const hasNoVulns = (critCount, highCount) => (formatCount(critCount) + formatCount(highCount)) === 0;

const cloneOrSkip = () => {
    if (!skipClone) {
        // remove repo if exists
        formatLog(`Clearing down ${repo}`);
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
    cloneOrSkip();
    
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
    let critCount = shell.exec('npm audit | grep "Critical" -c').stdout;
    let highCount = shell.exec('npm audit | grep "High" -c').stdout;
    if (hasNoVulns(critCount, highCount)) {
        formatLog('Ending early, no vulns detected');
        break;
    }

    // audit fix
    formatLog(`Running audit fix`);
    shell.exec('npm audit fix');
    
    // count vulns
    critCount = shell.exec('npm audit | grep "Critical" -c').stdout;
    highCount = shell.exec('npm audit | grep "High" -c').stdout;

    if (hasNoVulns(critCount, highCount)) {
        // create PR
        formatLog(`Creating PR for ${branch} against ${repo} ******`);

    } else {
        reposToIntervene.push(repo);
        formatLog(`NOT ALL VULNS SORTED USING 'npm audit fix' for ${repo}`, 'error');
    }
};

console.log('reposToIntervene', reposToIntervene);
