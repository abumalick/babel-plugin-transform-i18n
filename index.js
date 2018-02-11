// inspiration from original plugin and https://github.com/babel/babel/blob/1215db2dd3a6f1c13b2b446f05a2b55791c7a2a6/packages/babel-plugin-transform-es2015-template-literals/src/index.js
const nodejsPath = require('path');
const fs = require('fs');

const CHECK_DELAY = 3000;

const escape = (s) => {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function getModifiedTime(filePath, prevMtimeMs) {
    try {
        const stats = fs.statSync(filePath);
        if (stats) {
            return stats.mtimeMs;
        }
    }
    catch (err) {
        console.error(err.message);
    }
    return false;
}
function loadTranslations(translationsPath) {
    try {
        const translationsFile = nodejsPath.resolve(process.cwd(), translationsPath);
        console.log(`Reading: ${translationsFile} ...`);
        return JSON.parse(fs.readFileSync(translationsFile, 'utf-8'));
    }
    catch (err) {
        console.error(err.message);
    }
    return {};
}

module.exports = function({ types: t }) {
    return {
        pre() {
            this.translations = undefined;
            this.lastModifiedTime = undefined;
            this.lastChecked = undefined;
        },
        visitor: {
            TaggedTemplateExpression(path, state) {
                const translationTagName = state.opts.tagName || 't';
                if (t.isIdentifier(path.node.tag) && path.node.tag.name === translationTagName) {
                    if (typeof state.opts.translations === 'string') {
                        // import translations
                        const now = Date.now();
                        if (!this.lastChecked || now > this.lastChecked + CHECK_DELAY) {
                            const modifiedTime = getModifiedTime(state.opts.translations);
                            if (!this.lastChecked || (modifiedTime && modifiedTime > this.lastModifiedTime)) {
                                this.translations = loadTranslations(state.opts.translations);
                            }
                            this.lastChecked = now;
                            this.lastModifiedTime = modifiedTime;
                        }
                    }
                    else {
                        this.translations = state.opts.translations || {};
                    }

                    const { quasi } = path.node;
                    const { expressions, quasis } = quasi;
                    const preToken = state.opts.preToken || '#';
                    const postToken = state.opts.postToken || '#';

                    // create the original string with tokens inside (eg: 'Hello #1#')
                    let baseString = '';
                    quasis.forEach((templateElement, index) => {
                        const cooked = templateElement.value.cooked;
                        if (cooked) {
                            baseString += cooked;
                        }
                        if (index < expressions.length) {
                            baseString += `${preToken}${index + 1}${postToken}`;
                        }
                    });

                    // get translated value from translations
                    const translatedString = this.translations[baseString] || baseString;

                    // split the translation into strings and variables (eg: ['Salut ', '#1#'])
                    const tokenReg = new RegExp(`(${escape(preToken)}\\d{1,3}${escape(postToken)})`, 'g');
                    const tokenNumberReg = new RegExp(`${escape(preToken)}(\\d{1,3})${escape(postToken)}`);
                    const translationItems = translatedString.split(tokenReg);

                    // create an array of nodes for replacement
                    const nodes = [];
                    translationItems.filter((item) => item !== '').forEach((item, index) => {
                        if (tokenNumberReg.test(item)) {
                            const number = tokenNumberReg.exec(item);
                            if (number && number[1] && number[1] <= expressions.length) {
                                const expr = expressions[number[1] - 1];
                                if (!t.isStringLiteral(expr, { value: '' })) {
                                    nodes.push(expr);
                                }
                            }
                        }
                        else {
                            nodes.push(t.stringLiteral(item));
                        }
                    });
                    let root = nodes[0];
                    for (let i = 1; i < nodes.length; i++) {
                        root = t.binaryExpression('+', root, nodes[i]);
                    }
                    path.replaceWith(root);
                }
            }
        }
    };
};
