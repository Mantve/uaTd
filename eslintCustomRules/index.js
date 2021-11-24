const DEFAULT_SPACES_BEFORE = 0;
const DEFAULT_SPACES_AFTER = 1;

module.exports = {
    rules: {
        "no-template-literals": {
            create: function(context) {
                return {
                    TemplateLiteral(node) {
                        context.report(node, 'Do not use template literals.');
                    }
                };
            }
        },
        "var-length": {
            create: function(context) {
                return {
                    VariableDeclarator(node) {
                        if(node.id.name.length < 2){ 
                            context.report(node, 'Variable names should be longer than 1 character.'); 
                        } 
                    }
                };
            }
        },
        "var-length-except-for": {
            create: function(context) {
                return {
                    VariableDeclarator(node) {
                        if(node.id.name.length < 2 && node.parent.parent.type != 'ForStatement'){
                            context.report(node, 'Variable names should be longer than 1 character (except For statements).'); 
                        } 
                    }
                };
            }
        },
        "ts-type-annotation-spacing": {
            meta: {
                type: "layout",
                fixable: "code",
                hasSuggestions: true,
                schema: [
                    {
                        type: "object",
                        properties: {
                            before: {
                                type: "integer",
                                default: DEFAULT_SPACES_BEFORE
                            },
                            after: {
                                type: "integer",
                                default: DEFAULT_SPACES_AFTER
                            }
                        },
                        "additionalProperties": false
                    }
                ]
            },
            create: function(context) {
                const rule = Object.assign({}, context.options[0]);
                const initialSpacing = rule;
                if (!rule.before) rule.before = DEFAULT_SPACES_BEFORE;
                if (!rule.after) rule.after = DEFAULT_SPACES_AFTER;
                return {
                    VariableDeclarator(node) {
                        const tokens = context.getTokens(node);
                        const identifierTokens = tokens.filter(t => t.type == 'Identifier');
                        const punctuatorToken = tokens.find(t => t.type == 'Punctuator');
                        if(identifierTokens.length == 2 && punctuatorToken.value == ':'){
                            const spacesBeforeColon = punctuatorToken.range[0] - identifierTokens[0].range[1];
                            const spacesAfterColon = identifierTokens[1].range[0] - punctuatorToken.range[1];
                            if(spacesBeforeColon != rule.before || spacesAfterColon != rule.after){
                                context.report({
                                    node,
                                    "message": `Wrong spacing used in TypeScript type annotation! Spaces needed before: ${rule.before}, after: ${rule.after}.`,
                                    suggest: [
                                        {
                                            desc: `uaTd FIX: TypeScript type annotation spacing. (Expected ${rule.before} spaces before and ${rule.after} spaces after the colum, but found ${initialSpacing.before} before and ${initialSpacing.after} after).`,
                                            fix: function(fixer){
                                                return [
                                                    fixer.replaceTextRange([identifierTokens[0].range[1], punctuatorToken.range[0]], ' '.repeat(rule.before)),
                                                    fixer.replaceTextRange([punctuatorToken.range[1], identifierTokens[1].range[0]], ' '.repeat(rule.after))
                                                ];
                                            }
                                        }
                                    ],
                                    fix(fixer){
                                        return [
                                            fixer.replaceTextRange([identifierTokens[0].range[1], punctuatorToken.range[0]], ' '.repeat(rule.before)),
                                            fixer.replaceTextRange([punctuatorToken.range[1], identifierTokens[1].range[0]], ' '.repeat(rule.after))
                                        ];
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }
};