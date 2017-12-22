/* eslint-env jest */

const { formatComment } = require('../github-comment')

describe('formatComment', () => {
  it('formats with no changes', () => {
    expect(formatComment({
      formatted: {
        'changed': '',
        'folders': `<pre>
<a href="http://example.com/artifacts/index.html">src/         </a>     0.00% ❌
<a href="http://example.com/artifacts/coverage/index.html">src/coverage/</a>   100.00% ✅
</pre>`,
        'status': '58.66% 💛'
      },
      baseArtifactUrl: 'http://example.com/artifacts',
      buildNum: 2,
      buildUrl: 'http://example.com/build/2',
      priorBuildNum: 1,
      priorBuildUrl: 'http://example.com/build/1',
      branch: 'master'
    })).toMatchSnapshot()
  })
  it('formats with changes', () => {
    expect(formatComment({
      formatted: {
        'changed': `<pre>
<a href="http://example.com/artifacts/index.html">src/                </a>    10.00% 💔   -8.57% 😭
<a href="http://example.com/artifacts/bot.js.html">  bot.js            </a>   100.00% ✅ +100.00% 🎉
<a href="http://example.com/artifacts/cli.js.html">  cli.js            </a>    60.00% 💛  +60.00% 😍
<a href="http://example.com/artifacts/format-coverage.js.html">  format-coverage.js</a>    35.00% 💔   -1.13% 😥
<a href="http://example.com/artifacts/github-comment.js.html">  github-comment.js </a>    10.00% 💔  +10.00% 🙂
<a href="http://example.com/artifacts/parse-coverage.js.html">  parse-coverage.js </a>     0.00% ❌  -13.64% 😱
<a href="http://example.com/artifacts/new-file.js.html">  new-file.js       </a>     0.00% ❌
</pre>`,
        'folders': `<pre>
<a href="http://example.com/artifacts/index.html">src/</a>    10.00% 💔
</pre>`,
        'status': '30.00% 💔 +11.43% 😀'
      },
      baseArtifactUrl: 'http://example.com/artifacts',
      buildNum: 2,
      buildUrl: 'http://example.com/build/2',
      priorBuildNum: 1,
      priorBuildUrl: 'http://example.com/build/1',
      branch: 'master'
    })).toMatchSnapshot()
  })
})
