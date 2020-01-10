const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');

try {
  console.log('run build info action.');

  const lables = core.getInput('lables');
  console.log(`input labels:  ${lables}`);

  console.log('build info action done.');
} catch (error) {
  core.setFailed(error.message);
}
