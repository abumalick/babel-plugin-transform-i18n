// inspiration from original plugin and https://github.com/babel/babel/blob/1215db2dd3a6f1c13b2b446f05a2b55791c7a2a6/packages/babel-plugin-transform-es2015-template-literals/src/index.js

module.exports = function({ types: t }) {
    return {
        visitor: {
            TaggedTemplateExpression(path, state) {
                const translationFunctionName = state.opts.functionName || 't';
                if (t.isIdentifier(path.node.tag) && path.node.tag.name === translationFunctionName) {
                    const dictionary = state.opts.dictionary || {};
                    const { quasi } = path.node;
                    const { expressions, quasis } = quasi;
                    const nodes = [];
                    quasis.forEach((templateElement, index) => {
                        const cooked = templateElement.value.cooked;
                        if (cooked) {
                            nodes.push(t.stringLiteral(dictionary[cooked] || cooked));
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
