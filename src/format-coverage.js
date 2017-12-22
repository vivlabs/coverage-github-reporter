const pad = require('pad')
const { join, basename } = require('path')

const ALL_FILES_PATH = '*'

const ERROR_THRESHOLD = 50
const WARN_THRESHOLD = 80

const getEmoji = (percent) => {
  if (percent === 0) {
    return '❌'
  }
  if (percent < ERROR_THRESHOLD) {
    return '💔'
  }
  if (percent < WARN_THRESHOLD) {
    return '💛'
  }
  if (percent === 100) {
    return '✅'
  }
  return '💚'
}

const getDeltaEmoji = (delta, percent) => {
  if (percent === 0) {
    return '😱'
  }
  if (delta < -10) {
    return '😡'
  }
  if (delta < -5) {
    return '😭'
  }
  if (delta < 0) {
    return '😥'
  }
  if (percent === 100) {
    return '🎉'
  }
  if (delta > 50) {
    return '😍'
  }
  if (delta > 10) {
    return '😀'
  }
  /* istanbul ignore else - delta should never be zero */
  if (delta > 0) {
    return '🙂'
  }
}

const getPercent = (stats) => stats.percent

const formatPercent = (percent) =>
  `${pad(7, percent.toFixed(2))}% ` +
  `${getEmoji(percent)} `

const formatPercentDelta = (percent, priorPercent) => {
  const delta = percent - priorPercent
  return `${pad(7, (delta > 0 ? '+' : '') + delta.toFixed(2))}% ${getDeltaEmoji(delta, percent)}`
}

const formatDiffStats = (stats, priorStats) => {
  const percent = getPercent(stats)
  if (!priorStats) {
    return formatPercent(percent)
  }
  const oldPercent = getPercent(priorStats)
  if (percent === oldPercent) {
    return `${formatPercent(percent)} ${pad(7, ' (no change)')}`
  }
  return `${formatPercent(percent)} ${formatPercentDelta(percent, oldPercent)}`
}

exports.format = function (report, priorReport = {}, baseUrl = undefined) {
  const formatLink = (name, path) => {
    if (!baseUrl) {
      return name
    }
    if (path.endsWith('/')) {
      return `<a href="${baseUrl}/${path}index.html">${name}</a>`
    }
    return `<a href="${baseUrl}/${path}.html">${name}</a>`
  }

  const changedRows = []
  const allRows = []

  for (const path of Object.keys(report)) {
    if (path === ALL_FILES_PATH) {
      continue
    }

    const folderReport = report[path]
    const folderPriorReport = priorReport[path]
    if (folderPriorReport && getPercent(folderReport) !== getPercent(folderPriorReport)) {
      changedRows.push({
        label: path,
        path,
        stats: folderReport,
        priorStats: folderPriorReport
      })
      for (const file of Object.keys(folderReport.files)) {
        const fileStats = folderReport.files[file]
        const priorFileStats = folderPriorReport.files[file]
        if (priorFileStats
            ? getPercent(fileStats) !== getPercent(priorFileStats)
            : getPercent(fileStats) < 100
        ) {
          changedRows.push({
            label: '  ' + basename(file),
            path: join(path, file),
            stats: fileStats,
            priorStats: priorFileStats
          })
        }
      }
    }

    allRows.push({
      label: path,
      path,
      stats: folderReport
    })
  }

  const comment = [
    formatDiffStats(report[ALL_FILES_PATH], priorReport[ALL_FILES_PATH])
  ]

  function printTable (rows) {
    if (rows.length > 0) {
      const maxLabelLength = Math.max.apply(Math.max, rows.map(({ label }) => label.length))
      comment.push('<pre>')
      for (const { label, path, stats, priorStats } of rows) {
        comment.push(`${formatLink(pad(label, maxLabelLength), path)}  ${formatDiffStats(stats, priorStats)}`)
      }
      comment.push('</pre>')
    }
  }

  printTable(changedRows)

  comment.push('<details>')
  comment.push('<summary>Folder Coverage</summary>')
  printTable(allRows)
  comment.push('</details>')

  return comment.join('\n')
}
