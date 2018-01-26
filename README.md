# babel-plugin-transform-i18n [![Build Status](https://travis-ci.org/abumalick/babel-plugin-transform-i18n.svg?branch=master)](https://travis-ci.org/abumalick/babel-plugin-transform-i18n) [![codecov](https://codecov.io/gh/abumalick/babel-plugin-transform-i18n/branch/master/graph/badge.svg)](https://codecov.io/gh/abumalick/babel-plugin-transform-i18n) [![npm](https://img.shields.io/npm/v/babel-plugin-transform-i18n.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-transform-i18n)

A [Babel](https://babeljs.io) transform plugin to replace strings with their translations.

This plugin is a fork of [vimeo/babel-plugin-transform-i18n](https://github.com/vimeo/babel-plugin-transform-i18n)

## Example

**.babelrc**

```json
{
    "plugins": [
        ["transform-i18n", {
            "dictionary": {
                "Hello": "Bonjour",
                "Hello, {name}!": "Bonjour, {name}!"
            }
        }]
    ]
}
```

**In**

```js
const name = 'Brad';
const hello = t`Hello`;
const helloWithName = t`Hello, {name}!`;
```

**Out**

```js
const name = 'Brad';
const hello = 'Bonjour';
const helloWithName = 'Bonjour, ' + name + '!';
```

## Installation

```bash
yarn add babel-plugin-transform-i18n
```

or with npm

```bash
npm install babel-plugin-transform-i18n --save
```

## Usage

### Via `.babelrc`

```json
{
    "plugins": [
        ["transform-i18n", {
            "functionName": "t",
            "dictionary": {}
        }]
    ]
}
```

### Via Node API

```js
require('babel-core').transform('code', {
    plugins: [
        ['transform-i18n', {
            functionName: 't',
            dictionary: {}
        }]
    ]
});
```

## Options

There are two options available, both are optional:

### `dictionary`

A mapping of the strings passed to the translation function to their translated versions. If no dictionary is passed, calls to the translation function will be replaced with the original string.

### `functionName`

The name of the tag function that wraps the strings. Defaults to `t`.
