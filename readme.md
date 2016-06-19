# ava-files [![Build Status](https://travis-ci.org/avajs/ava-files.svg?branch=master)](https://travis-ci.org/avajs/ava-files) [![Coverage Status](https://coveralls.io/repos/github/avajs/ava-files/badge.svg?branch=master)](https://coveralls.io/github/avajs/ava-files?branch=master)

> Used by AVA for test file resolution


## Install

```
$ npm install --save ava-files
```


## Usage

```js
const AvaFiles = require('ava-files');

const avaFiles = new AvaFiles({
  cwd: '/path/to/cwd',
  files: ['**/glob/patterns/**'],
  sources: ['**/glob/patterns/**']
});

const isTest = avaFiles.makeTestMatcher();

isTest(filePath);
//=> true or false

const isSource = avaFiles.makeSourceMatcher();

isSource(filePath);
//=> true or false

avaFiles.findTestFiles().then(files => {
  // files is an array of found test files
});
```


## API

### avaFiles(input, [options])

#### input

Type: `string`

Lorem ipsum.

#### options

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.


## License

MIT © [James Talmage](http://github.com/avajs)
