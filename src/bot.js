// circle-github-bot is pretty gnarly, ideally we'll swap it out
const Bot = require('circle-github-bot')
const { curl } = require('./curl')
const { coverageJsonToReport } = require('./coverage/parse')

// Workaround for circle-github-bot failing if environment variables are not found
if (!process.env.CI_PULL_REQUEST) {
  process.env.CI_PULL_REQUEST = ''
}
if (!process.env.CIRCLE_ARTIFACTS) {
  process.env.CIRCLE_ARTIFACTS = ''
}

// For workflows we need to work backward through the builds to find the previous build of
// the same job.
//
// API defaults to 30 builds (when this code was written), and it seems to be
// fast enough, and I imagine most workflows are < 10 steps, so it feels good.
//
// In theory we could get N + 1 builds (where N is the max number of steps), but it'd have to be
// updated every time we add a workflow step.
const BUILD_RETRIEVAL_LIMIT = 30

Bot.prototype.getPullRequest = function () {
  return JSON.parse(curl(this.githubRepoUrl(`pulls/${this.env.prNumber}`)))
}
Bot.prototype.circleProjectUrl = function (path) {
  const project = `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}`
  return `https://${process.env.CIRCLE_CI_API_TOKEN}:@circleci.com/api/v1.1/project/github/${project}/${path}`
}
Bot.prototype.latestBranchBuilds = function (branch, count = 30) {
  return JSON.parse(curl(this.circleProjectUrl(`tree/${branch}?limit=${count}`)))
}
Bot.prototype.artifacts = function (buildNum) {
  return JSON.parse(curl(this.circleProjectUrl(`${buildNum}/artifacts`)))
}

Bot.prototype.oldArtifactUrl = Bot.prototype.artifactUrl

Bot.prototype.artifactUrl = function (path) {
  return this.oldArtifactUrl(path)
    // Fix for CircleCI 2.0 URL format
    .replace(`${process.env.HOME}/${process.env.CIRCLE_PROJECT_REPONAME}/`, '')
}
Bot.prototype.getJsonArtifact = function (url) {
  return JSON.parse(curl(`${url}?circle-token=${process.env.CIRCLE_CI_API_TOKEN}`))
}

Bot.prototype.getBaseBranch = function (defaultBaseBranch) {
  // Get base branch from PR, default to master
  if (process.env.CI_PULL_REQUEST) {
    console.log(`PR build ${process.env.CI_PULL_REQUEST}`)
    const branch = this.getPullRequest().base.ref
    console.log(`Got PR base branch "${branch}"`)
    return branch
  }
  console.log(`Not a PR build (might be Circle CI bug), comparing to ${defaultBaseBranch} branch`)
  return defaultBaseBranch
}

Bot.prototype.getPriorBuild = function (branch, coverageJsonFilename) {
  // Get latest builds for branch
  const baseBranchBuilds = this.latestBranchBuilds(branch, BUILD_RETRIEVAL_LIMIT)
  if (baseBranchBuilds) {
    console.log(`Got ${baseBranchBuilds.length} build(s) for ${branch}`)
    for (const build of baseBranchBuilds) {
      const buildNum = build.build_num
      if (process.env.CIRCLE_WORKFLOW_ID) {
        if (!build.build_parameters || build.build_parameters.CIRCLE_JOB !== process.env.CIRCLE_JOB) {
          console.log(`Build ${buildNum} doesn't match workflow job`)
          // Different job…
          continue
        }
      }
      if (String(buildNum) === process.env.CIRCLE_BUILD_NUM) {
        console.log(`Build ${buildNum} is self`)
        // Don't want to compare against self
        continue
      }
      console.log(`Comparing to build ${buildNum}`)
      // Get artifact
      const artifacts = this.artifacts(buildNum)
      if (!artifacts) {
        console.error(`No artifacts found for build ${buildNum}`)
        break
      }
      const artifact = artifacts.find(({ path }) => path === coverageJsonFilename)
      if (artifact) {
        console.error(`Could not find "${coverageJsonFilename}" in artifacts`)
        console.log(artifacts)
        break
      }
      const coverageJson = this.getJsonArtifact(artifact.url)
      if (!coverageJson) {
        throw new Error(`Could not load artifact from ${artifact.url}`)
      }
      const base = process.env.CIRCLE_WORKING_DIRECTORY.replace(/~\//, process.env.HOME + '/')
      const priorCoverage = coverageJsonToReport(coverageJson, base)
      const priorBuild = buildNum
      console.log(`Loaded prior coverage from build ${priorBuild} artifacts`)
      return { priorCoverage, priorBuild }
    }
  }
  return {}
}

exports.Bot = Bot
