# markdown-it-relativelink

[![Build Status](https://img.shields.io/travis/GerHobbelt/markdown-it-ins/markdown-it-relativelink.svg?style=flat)](https://travis-ci.org/GerHobbelt/markdown-it-ins)
[![NPM version](https://img.shields.io/npm/v/@gerhobbelt/markdown-it-relativelink.svg?style=flat)](https://www.npmjs.org/package/@gerhobbelt/markdown-it-relativelink)
[![Coverage Status](https://img.shields.io/coveralls/GerHobbelt/markdown-it-ins/markdown-it-relativelink.svg?style=flat)](https://coveralls.io/r/GerHobbelt/markdown-it-ins?branch=markdown-it-relativelink)

__v1.+ requires `markdown-it` v4.+, see changelog.__

`[[relative link]]` => `<a href="http://myprefix/relative-link">relative link</a>`



## Install

node.js, browser:

```bash
npm install @gerhobbelt/markdown-it-relativelink --save
bower install @gerhobbelt/markdown-it-relativelink --save
```

## Use

```js
var md = require('@gerhobbelt/markdown-it')()
            .use(require('@gerhobbelt/markdown-it-relativelink')({
                prefix: 'http://example.com/'
            }));

md.render('[[link]]') // => '<p><a href="http://example.com/link">link</a></p>'
```


## License

[MIT](https://github.com/GerHobbelt/markdown-it-ins/blob/markdown-it-relativelink/LICENSE)
