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

const getPercent = (stats) => stats ? stats.percent : 0

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
    if (path === '/') {
      return `<a href="${baseUrl}/index.html">${name}</a>`
    }
    if (path.endsWith('/')) {
      return `<a href="${baseUrl}/${path}index.html">${name}</a>`
    }
    return `<a href="${baseUrl}/${path}.html">${name}</a>`
  }

  const addChangedFileRows = (rows, folder, stats, priorStats) => {
    if (priorStats && stats.files && getPercent(priorStats) !== getPercent(stats)) {
      for (const path of Object.keys(stats.files)) {
        const fileStats = stats.files[path]
        const priorFileStats = priorStats.files[path]
        if (priorFileStats
          ? getPercent(fileStats) !== getPercent(priorFileStats)
          : getPercent(fileStats) < 100
        ) {
          rows.push({
            label: '  ' + basename(path),
            path: join(folder, path),
            stats: fileStats,
            priorStats: priorFileStats
          })
        }
      }
    }
  }
  const changedRows = []
  const allRows = []

  for (const path of Object.keys(report)) {
    if (path === ALL_FILES_PATH) {
      continue
    }

    const folderReport = report[path]
    const folderPriorReport = priorReport[path]
    if (getPercent(folderReport) !== getPercent(folderPriorReport)) {
      changedRows.push({
        label: path,
        path,
        stats: folderReport,
        priorStats: folderPriorReport
      })
      addChangedFileRows(changedRows, path, folderReport, folderPriorReport)
    }

    allRows.push({
      label: path,
      path,
      stats: folderReport
    })
  }

  const comment = [
    `${formatLink('Project Coverage', '/')}  ${formatDiffStats(report[ALL_FILES_PATH], priorReport[ALL_FILES_PATH])}`
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
