const pad = require('pad')
const { basename } = require('path')

const ALL_FILES_LABEL = 'All Files'

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
  return '💚'
}

const getDeltaEmoji = (percent) => {
  if (percent < -10) {
    return '‼️'
  }
  if (percent < -5) {
    return '😭'
  }
  if (percent < 0) {
    return '😥'
  }
  if (percent > 20) {
    return '🎉'
  }
  if (percent > 0) {
    return '😍'
  }
  return '😐'
}

const getPercent = (stats) => stats ? stats.percent : 0

const formatPercent = (percent) =>
  `${pad(7, percent.toFixed(2))}% ` +
  `${getEmoji(percent)} `

const formatPercentDelta = (delta) =>
  `${pad(7, (delta > 0 ? '+' : '') + delta.toFixed(2))}% ${getDeltaEmoji(delta)}`

const formatDiffStats = (stats, priorStats) => {
  const percent = getPercent(stats)
  if (!priorStats) {
    return formatPercent(percent)
  }
  const oldPercent = getPercent(priorStats)
  if (percent === oldPercent) {
    return `${formatPercent(percent)} (no change ${getDeltaEmoji(0)})`
  }
  return `${formatPercent(percent)} ${formatPercentDelta(percent - oldPercent)}`
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

  const getChangedFileRows = (stats, priorStats) => {
    const rows = []
    if (priorStats && stats.files && getPercent(priorStats) !== getPercent(stats)) {
      for (const path of Object.keys(stats.files)) {
        const fileStats = stats.files[path]
        const priorFileStats = priorStats.files[path]
        if (getPercent(fileStats) !== getPercent(priorFileStats)) {
          rows.push({
            label: '  ' + basename(path),
            path,
            stats: fileStats,
            priorStats: priorFileStats
          })
        }
      }
      // if (rows.length > 0) {
      //   rows.push({ label: '' })
      // }
    }
    return rows
  }
  const rows = [
    {
      label: ALL_FILES_LABEL,
      path: '/',
      stats: report[ALL_FILES_PATH],
      priorStats: priorReport[ALL_FILES_PATH]
    },
    {
      label: ''
    }
  ]

  for (const path of Object.keys(report)) {
    if (path === ALL_FILES_PATH) {
      continue
    }
    const folderReport = report[path]
    const folderPriorReport = priorReport[path]
    rows.push({
      label: path,
      path,
      stats: folderReport,
      priorStats: folderPriorReport
    })
    rows.push.apply(rows, getChangedFileRows(folderReport, folderPriorReport))
  }

  const maxLabelLength = Math.max.apply(Math.max, rows.map(({ label }) => label.length))

  return `
<pre>
${rows.map(({ label, path, stats, priorStats }) =>
  path
    ? `${formatLink(pad(label, maxLabelLength), path)}  ${formatDiffStats(stats, priorStats)}`
    : label
).join('\n')}
</pre>
`
}
