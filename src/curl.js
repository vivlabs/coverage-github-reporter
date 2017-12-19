const { execSync } = require('child_process')

// This is based on circle-github-bot and should be changed
exports.curl = function curl (url, params = '') {
  return execSync(`curl --silent ${params} "${url}"`).toString('utf8').trim()
}
