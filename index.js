const core = require('@actions/core');
const crypto = require('crypto');
const fs = require('fs');

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
  let branchName;
  switch (process.env.GITHUB_EVENT_NAME) {
    case 'push':
      branchName = process.env.GITHUB_REF;
      break;
    case 'release':
      branchName = process.env.GITHUB_REF;
      break;
    default:
      branchName = process.env.GITHUB_HEAD_REF;
      break;
  }
  return branchName.replace(/[^a-zA-Z0-9-_.]/g, '-');
};

const setBranchName = () => {
  core.setOutput('branch_name', getBranchName());
};

const setSandbox = () => {
  const labels = JSON.parse(core.getInput('labels'));
  const sandbox = chooseSandbox(labels);
  core.setOutput('environment_name', sandbox);
};

const setVersion = () => {
  const eventName = process.env.GITHUB_EVENT_NAME;
  console.log('eventName', eventName);
  let version = process.env.GITHUB_SHA.substring(0, 8);
  if (eventName === 'pull_request') {
    version = crypto
      .createHash('sha256')
      .update(process.env.GITHUB_HEAD_REF)
      .digest('hex')
      .substring(0, 8);
  } else if (eventName === 'release') {
    version = `${process.env.GITHUB_REF.split('/').pop()}-${version}`;
  }
  core.setOutput('version', version);
};

const setPackageVersion = () => {
  try {
    const packageInfo = fs.readFileSync('./package.json');
    const json = JSON.parse(packageInfo);
    core.setOutput('package_version', (json && json.version) || '');
  } catch {
    core.setOutput('package_version', 'unknown');
  }
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

const main = () => {
  try {
    console.log('run build info action.');

    setBranchName();
    setSandbox();
    setVersion();
    setUrl();
    setPackageVersion();

    console.log('build info action done.');
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
