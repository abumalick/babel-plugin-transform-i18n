# babel-plugin-transform-i18n [![Build Status](https://travis-ci.org/abumalick/babel-plugin-transform-i18n.svg?branch=master)](https://travis-ci.org/abumalick/babel-plugin-transform-i18n) [![codecov](https://codecov.io/gh/abumalick/babel-plugin-transform-i18n/branch/master/graph/badge.svg)](https://codecov.io/gh/abumalick/babel-plugin-transform-i18n) [![npm](https://img.shields.io/npm/v/babel-plugin-transform-i18n.svg?maxAge=2592000)](https://www.npmjs.com/package/babel-plugin-transform-i18n)

A [Babel](https://babeljs.io) transform plugin to replace strings with their translations.

This plugin is a fork of [vimeo/babel-plugin-transform-i18n](https://github.com/vimeo/babel-plugin-transform-i18n)

## Example

**.babelrc**

```json
{
    "plugins": [
        ["transform-i18n", {
            "translations": {
                "Hello": "Bonjour",
                "Hello, #1#!": "Bonjour, #1#!"
            }
        }]
    ]
}
```

**In**

```js
const name = 'Brad';
const hello = t`Hello`;
const helloWithName = t`Hello, ${name}!`;
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
            "translations": "path/to/translations.json",
            "preToken": "#",
            "postToken": "#",
            "tagName": "t"
        }]
    ]
}
```

### Via Node API

```js
require('babel-core').transform('code', {
    plugins: [
        ['transform-i18n', {
            tagName: 't',
            translations: "path/to/translations.json"
        }]
    ]
});
```

## Options

There are two options available, both are optional:
### `preToken` and `postToken`

String to identify the token. Default is `#` for both. It permit to include variables in translation: `"Hello, #1#!": "Bonjour, #1#!"`.

### `translations`

A mapping of the strings passed to the translation function to their translated versions. It can also be the path to json file. If no translations is passed, calls to the translation function will be replaced with the original string.


### `tagName`

The name of the tag function that wraps the strings. Defaults to `t`.

## Notes

### Order of tokens in translation

You can change the order in translation:

```js
"#1#, #2#!": "#2# #1#!"
```

But the order in the first string should always be from smaller to higher. **This is not correct** and will reverse the order:

```js
"#2#, #1#!": "#2# #1#!"
```
