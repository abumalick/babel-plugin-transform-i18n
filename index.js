// inspiration from original plugin and https://github.com/babel/babel/blob/1215db2dd3a6f1c13b2b446f05a2b55791c7a2a6/packages/babel-plugin-transform-es2015-template-literals/src/index.js
const nodejsPath = require('path');
const fs = require('fs');

module.exports = function({ types: t }) {
    return {
        pre() {
            this.translations = undefined;
        },
        visitor: {
            TaggedTemplateExpression(path, state) {
                const translationTagName = state.opts.tagName || 't';
                if (t.isIdentifier(path.node.tag) && path.node.tag.name === translationTagName) {
                    if (!this.translations) {
                        if (typeof state.opts.translations === 'string') {
                            try {
                                const translationsFile = nodejsPath.resolve(process.cwd(), state.opts.translations);
                                console.log(`Reading: ${translationsFile} ...`);
                                this.translations = JSON.parse(fs.readFileSync(translationsFile, 'utf-8'));
                                console.log('Successfully imported translations.');
                            }
                            catch (err) {
                                this.translations = {};
                                console.warn(err.message);
                            }
                        }
                        else {
                            this.translations = state.opts.translations || {};
                        }
                    }
                    const { quasi } = path.node;
                    const { expressions, quasis } = quasi;
                    const nodes = [];
                    quasis.forEach((templateElement, index) => {
                        const cooked = templateElement.value.cooked;
                        if (cooked) {
                            nodes.push(t.stringLiteral(this.translations[cooked] || cooked));
                        }
                        if (index < expressions.length) {
                            const expr = expressions[index];
                            if (!t.isStringLiteral(expr, { value: '' })) {
                                nodes.push(expr);
                            }
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
