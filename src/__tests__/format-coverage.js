/* eslint-env jest */

const { format } = require('../format-coverage')

describe('format', () => {
  it('formats report', () => {
    expect(format(require('./basic-report.json'))).toMatchSnapshot()
  })

  it('formats report with links', () => {
    expect(format(
      require('./basic-report.json'),
      undefined,
      'http://example.com/artifacts'
    )).toMatchSnapshot()
  })

  it('formats delta report', () => {
    expect(format(
      require('./basic-report2.json'),
      require('./basic-report.json')
    )).toMatchSnapshot()
  })

  it('formats delta report with links', () => {
    expect(format(
      require('./basic-report2.json'),
      require('./basic-report.json'),
      'http://example.com/artifacts'
    )).toMatchSnapshot()
  })
})
