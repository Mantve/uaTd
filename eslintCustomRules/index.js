module.exports = {
    rules: {
        "no-template-literals": {
            create: function(context) {
                return {
                    TemplateLiteral(node) {
                        context.report(node, 'Do not use template literals');
                    }
                };
            }
        },
        "var-length": {
            create: function(context) {
                return {
                    VariableDeclarator(node) {
                        if(node.id.name.length < 2){ 
                            context.report(node, 'Variable names should be longer than 1 character'); 
                        } 
                    }
                };
            }
        }
    }
};