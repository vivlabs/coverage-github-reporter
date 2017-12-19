module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js',
      'src/**/*.json',
      'src/**/__mocks__/**/*',
      'src/**/__tests__/*.js.snap',
      '!src/**/__tests__/*.js'
    ],

    tests: [
      'src/**/__tests__/*.js'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },
    testFramework: 'jest'
  }
}
