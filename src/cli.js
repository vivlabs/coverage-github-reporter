#!/bin/bash

const args = require('args')

args
  .option(['j', 'coverage-json'], 'Relative path to istanbul coverage JSON', 'coverage/coverage-final.json')
  .option(['r', 'coverage-root'], 'Relative path to coverage html root (for artifact links)', 'coverage/lcov-report')
  .option(['b', 'branch'], 'Base branch to use if not PR', 'master')

const {
  coverageJson,
  coverageRoot,
  branch
} = args.parse(process.argv)

const { run } = require('./github-comment')

try {
  const params = {
    coverageJsonFilename: coverageJson,
    coverageHtmlRoot: coverageRoot,
    defaultBaseBranch: branch
  }
  console.log('Running with', params)
  run(params)
} catch (err) {
  console.error(err)
}
