const { resolve } = require('path')
const { Bot } = require('./bot')
const { parseFile } = require('./coverage/parse')
const { format } = require('./coverage/format')

exports.postComment = function postComment ({
  coverageJsonFilename = 'coverage/coverage-final.json',
  coverageHtmlRoot = 'coverage/lcov-report',
  defaultBaseBranch = 'master',
  root = process.cwd()
}) {
  const bot = Bot.create()

  const coverage = parseFile(root, resolve(root, coverageJsonFilename))

  const branch = bot.getBaseBranch(defaultBaseBranch)
  const { priorCoverage, priorBuild } = bot.getPriorBuild(branch, coverageJsonFilename)

  if (!priorCoverage) {
    console.log(`No prior coverage found`)
  }

  const result = JSON.parse(bot.comment(`
**[Code Coverage](${bot.artifactUrl(`/${coverageHtmlRoot}/index.html`)})** 
  from Circle CI [build ${process.env.CIRCLE_BUILD_NUM}](${process.env.CIRCLE_BUILD_URL})
  ${priorBuild
    ? `(compared to [build ${priorBuild}](${process.env.CIRCLE_BUILD_URL.replace(/\/\d+$/, `/${priorBuild}`)}) of \`${branch}\` branch)`
    : ''}

${format(coverage, priorCoverage, bot.artifactUrl(`/${coverageHtmlRoot}`))}
`))
  return result && result.html_url
}
