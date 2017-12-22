const pad = require('pad')
const { basename } = require('path')

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

const formatPercent = (percent, padding) =>
  `${pad(padding, percent.toFixed(2))}% ` +
  `${getEmoji(percent)}`

const formatPercentDelta = (percent, priorPercent, padding) => {
  const delta = percent - priorPercent
  return `${pad(padding, (delta > 0 ? '+' : '') + delta.toFixed(2))}% ${getDeltaEmoji(delta, percent)}`
}

const formatDiffStats = (stats, priorStats, padding = 7) => {
  const percent = getPercent(stats)
  if (!priorStats) {
    return formatPercent(percent, padding)
  }
  const oldPercent = getPercent(priorStats)
  if (percent === oldPercent) {
    return `${formatPercent(percent, padding)} ${pad(padding, '(no change)')}`
  }
  return `${formatPercent(percent, padding)} ${formatPercentDelta(percent, oldPercent, padding)}`
}

exports.format = function (report, priorReport = {}, baseUrl = undefined) {
  const formatLink = (name, link) => {
    if (!baseUrl) {
      return name
    }
    return `<a href="${baseUrl}/${link}">${name}</a>`
  }

  const changedRows = []
  const allRows = []

  for (const path of Object.keys(report)) {
    if (path === ALL_FILES_PATH) {
      continue
    }

    const folderReport = report[path]
    const folderPriorReport = priorReport[path]
    const { htmlPath } = folderReport
    const link = htmlPath + 'index.html'
    if (folderPriorReport && getPercent(folderReport) !== getPercent(folderPriorReport)) {
      changedRows.push({
        label: path,
        link,
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
            link: `${htmlPath}${file}.html`,
            stats: fileStats,
            priorStats: priorFileStats
          })
        }
      }
    }

    allRows.push({
      label: path,
      link,
      stats: folderReport
    })
  }

  function getTable (rows) {
    const comment = []
    if (rows.length > 0) {
      const maxLabelLength = Math.max.apply(Math.max, rows.map(({ label }) => label.length))
      comment.push('<pre>')
      for (const { label, link, stats, priorStats } of rows) {
        comment.push(`${formatLink(pad(label, maxLabelLength), link)}  ${formatDiffStats(stats, priorStats)}`)
      }
      comment.push('</pre>')
    }
    return comment.join('\n')
  }

  return {
    status: formatDiffStats(report[ALL_FILES_PATH], priorReport[ALL_FILES_PATH], 0),
    changed: getTable(changedRows),
    folders: getTable(allRows)
  }
}
