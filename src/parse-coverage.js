const { readFileSync } = require('fs')
const { relative, dirname, basename } = require('path')
const libCoverage = require('istanbul-lib-coverage')

function calculateCoverage (stats) {
  // { lines: { total: 615, covered: 281, skipped: 0, pct: 45.69 },
  //   statements: { total: 723, covered: 286, skipped: 0, pct: 39.56 },
  //   functions: { total: 169, covered: 76, skipped: 0, pct: 44.97 },
  //   branches: { total: 308, covered: 88, skipped: 0, pct: 28.57 } } }
  if (stats.total === 0) {
    return 100
  }
  return (stats.covered + stats.skipped) / stats.total * 100
}

function getSimpleCoverage (summary) {
  const { statements, branches } = summary.toJSON()
  const statementsCoverage = calculateCoverage(statements)
  if (branches.total === 0) {
    return { percent: statementsCoverage }
  }
  const branchesCoverage = calculateCoverage(branches)
  return {
    percent: statementsCoverage * 0.75 + branchesCoverage * 0.25
  }
}

exports.coverageJsonToReport = function (json, base) {
  const map = libCoverage.createCoverageMap(json)
  const globalSummary = libCoverage.createCoverageSummary()

  const report = { '*': {} }

  const summaries = {}

  // inspect and summarize all file coverage objects in the map
  for (const file of map.files()) {
    const folder = relative(base, dirname(file)) + '/'
    if (!summaries[folder]) {
      summaries[folder] = libCoverage.createCoverageSummary()
      report[folder] = { files: {} }
    }
    const fileSummary = map.fileCoverageFor(file).toSummary()
    globalSummary.merge(fileSummary)
    summaries[folder].merge(fileSummary)

    report[folder].files[basename(file)] = getSimpleCoverage(fileSummary)
  }

  for (const folder of Object.keys(summaries)) {
    Object.assign(report[folder], getSimpleCoverage(summaries[folder]))
  }

  report['*'] = getSimpleCoverage(globalSummary)
  return report
}

exports.parseFile = function (base, coveragePath) {
  const json = JSON.parse(readFileSync(coveragePath, 'utf8'))
  return exports.coverageJsonToReport(json, base)
}
