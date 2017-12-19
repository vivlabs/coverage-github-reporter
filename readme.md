# coverage-github-reporter

[![npm version](https://badge.fury.io/js/coverage-github-reporter.svg)](https://badge.fury.io/js/coverage-github-reporter) [![CircleCI](https://circleci.com/gh/vivlabs/coverage-github-reporter.svg?style=svg)](https://circleci.com/gh/vivlabs/coverage-github-reporter)

Report Jest/Istanbul coverage statistics from CircleCI to GitHub

## Setup

### GitHub Auth Token

A GitHub auth token is required to post a comment on github. I recommend creating a separate "bot" GitHub account with
access to your repos.

1. Navigate to [Personal access tokens](https://github.com/settings/tokens) on GitHub
2. Click "Generate new token" and generate a new token (with **repo** access if your repo is private)
3. Open the CircleCI project settings
4. Navigate to Build Settings > Environment variables
5. Add a new variable called `GH_AUTH_TOKEN` with the new token

Once you have this token, you can easily import it to other repos on CircleCI and skip steps 1, 2, and 5.

### Run Jest with Coverage reporting

Add to your `package.json`:
```bash
npm install --save-dev coverage-github-reporter
```

If you're using Jest, I suggest adding a test script along these lines:
```json
    "scripts": {
        "test-ci": "jest --ci --silent --coverage"
    }
```

This will generate a coverage in `coverage/`

### CircleCI configuration

Update your `.circleci/config.yml`:
```yml
general:
  artifacts:
    - "coverage/lcov-report"

jobs:
  build:
    steps:
      # … other steps (npm/yarn install, lint, etc)

      - run:
          name: Test
          command: npm run test-ci

      # Store coverage artifacts so they can be browsed and be diffed by other builds
      - store_artifacts:
          path: coverage
          destination: coverage

      - run:
          name: Post coverage comment to GitHub
          command: npx report-coverage
```

### Customization

The `report-coverage` CLI has some options to customize behavior:

```
  Options:

    -b, --branch [value]         Base branch to use if not PR (defaults to "master")
    -j, --coverage-json [value]  Relative path to istanbul coverage JSON (defaults to "coverage/coverage-final.json")
    -r, --coverage-root [value]  Relative path to coverage html root (for artifact links) (defaults to "coverage/lcov-report")
    -h, --help                   Output usage information
    -v, --version                Output the version number
```
