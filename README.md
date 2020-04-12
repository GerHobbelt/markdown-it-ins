# markdown-it-ins

[![Build Status](https://img.shields.io/travis/GerHobbelt/markdown-it-ins/master.svg?style=flat)](https://travis-ci.org/GerHobbelt/markdown-it-ins)
[![NPM version](https://img.shields.io/npm/v/@gerhobbelt/markdown-it-ins.svg?style=flat)](https://www.npmjs.org/package/@gerhobbelt/markdown-it-ins)
[![Coverage Status](https://img.shields.io/coveralls/GerHobbelt/markdown-it-ins/master.svg?style=flat)](https://coveralls.io/r/GerHobbelt/markdown-it-ins?branch=master)

> `<ins>` tag plugin for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

__v3.+ requires `markdown-it` v10.+, see changelog.__

`++inserted++` => `<ins>inserted</ins>`

Markup uses the same conditions as CommonMark [emphasis](http://spec.commonmark.org/0.15/#emphasis-and-strong-emphasis).


## Install

node.js, browser:

```bash
npm install @gerhobbelt/markdown-it-ins --save
bower install @gerhobbelt/markdown-it-ins --save
```

## Use

```js
var md = require('@gerhobbelt/markdown-it')()
            .use(require('@gerhobbelt/markdown-it-ins'));

md.render('++inserted++') // => '<p><ins>inserted</ins></p>'
```

_Differences in browser._ If you load script directly into the page, without
package system, module will add itself globally as `window.markdownitIns`.


## License

[MIT](https://github.com/GerHobbelt/markdown-it-ins/blob/master/LICENSE)
