/* eslint-env jest */

const { format } = require('../format')

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

  it('formats delta report 2', () => {
    expect(format(
      require('./basic-report3.json'),
      require('./basic-report2.json')
    )).toMatchSnapshot()
  })

  it('formats delta report with no changes', () => {
    expect(format(
      require('./basic-report2.json'),
      require('./basic-report2.json')
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
