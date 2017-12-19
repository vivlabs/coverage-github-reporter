/* eslint-env jest */

const { resolve } = require('path')

const { parseFile } = require('../parse-coverage')

describe('parseFile', () => {
  it('parses', () => {
    expect(parseFile('/root/app', resolve(__dirname, 'coverage-final.json'))).toMatchSnapshot()
  })
  it('parses 2', () => {
    expect(parseFile('/root/app', resolve(__dirname, 'coverage-final2.json'))).toMatchSnapshot()
  })
})
