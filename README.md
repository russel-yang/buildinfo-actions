# @d2c-actions/buildinfo
## Description

get build information

## Inputs

| parameter | description | required | default |
| - | - | - | - |
| labels | pull request labels, for push , it is empty array | `true,` | [] |
| available_sandboxes | available sandboxes | `true` | sandbox1,sandbox2,sandbox3 |
| master_environment_name | master branch default environment name | `true` | T2gpWebDocker-env |
| environment_prefix | prefix for the environment name | `true` |  |
| develop_environment_name | develop branch default environment name | `true` | d2c-beanstalk-infra-dev |
| release_environment_name | release environment name | `true` | d2c-beanstalk-infra-dev |
| url_mappings | environment name to url url_mappings | `false` | {} |
| branch_name_max | maximum length of sanitized branch name | `true` | 63 |


## Outputs

| parameter | description |
| - | - |
| environment_name | beanstalk environment name |
| branch_name | branch name |
| version | git commit short hash |
| url | the deploy url |
| package_version | the version from package.json |


## Runs

This action is an `node16` action.


