const core = require('@actions/core');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const crypto = require('crypto');

const chooseSandbox = labels => {
  //environment_prefix
  const environment_prefix = core.getInput('environment_prefix');
  const sandboxes = core
    .getInput('available_sandboxes')
    .split(',')
    .map(item => item.trim()) || ['sandbox1', 'sandbox2', 'sandbox3'];
  for (label of labels) {
    if (sandboxes.includes(label)) {
      return `${environment_prefix}${label}`;
    }
  }

  const eventName = process.env.GITHUB_EVENT_NAME;
  if (getBranchName() === 'master') {
    return core.getInput('master_environment_name') || 'T2gpWebDocker-env';
  } else if (getBranchName() === 'develop') {
    return core.getInput('develop_environment_name');
  } else if (eventName === 'release' || getBranchName() === 'release') {
    return core.getInput('release_environment_name');
  }
  return '';
};

const getBranchName = () => {
  const eventName = process.env.GITHUB_EVENT_NAME;
  const ref = process.env.GITHUB_REF;
  let branchName;
  if (eventName === 'push') {
    branchName = ref.split('/').pop();
  } else if (eventName === 'release') {
    branchName = ref.split('/').pop();
  } else {
    branchName = process.env.GITHUB_HEAD_REF;
  }
  return branchName;
};

const setBranchName = () => {
  core.setOutput('branch_name', getBranchName());
};

const setSandbox = () => {
  const labels = JSON.parse(core.getInput('labels'));
  if (labels.length) {
    const sandbox = chooseSandbox(labels);
    core.setOutput('environment_name', sandbox);
  }
};

const setVersion = async () => {
  const eventName = process.env.GITHUB_EVENT_NAME;
  console.log('eventName', eventName);
  let version = process.env.GITHUB_SHA.substring(0, 8);
  if (eventName === 'pull_request') {
    const head = process.env.GITHUB_REF.replace('merge', 'head');
    console.log(
      crypto
        .createHash('sha256')
        .update(process.env.GITHUB_HEAD_REF)
        .digest('hex')
    );
    console.log('head:', head);
    version = (await exec(`git ls-remote -q | grep ${head}`)).stdout.substring(
      0,
      8
    );
  } else if (eventName === 'release') {
    version = `${process.env.GITHUB_REF.split('/').pop()}-${version}`;
  }
  core.setOutput('version', version);
};

const setUrl = () => {
  const environment_prefix = core.getInput('environment_prefix');
  const labels = JSON.parse(core.getInput('labels'));
  const sandbox = chooseSandbox(labels);
  console.log(core.getInput('url_mappings'));
  const urlMappings = JSON.parse(core.getInput('url_mappings'));
  if (sandbox && urlMappings) {
    core.setOutput('url', urlMappings[sandbox.replace(environment_prefix, '')]);
  }
};

const main = async () => {
  try {
    console.log('run build info action.');

    setBranchName();
    setSandbox();
    await setVersion();
    setUrl();

    console.log('build info action done.');
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
