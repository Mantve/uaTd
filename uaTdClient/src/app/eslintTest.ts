// "no-template-literals"
const ruleTemplateLiteral = "no-template-literals";
let templateLiteral = `This is to test "${ruleTemplateLiteral}" rule.`;

// "var-length"
// "var-length-except-for"
var a = 1;
let b = 2;
const c = 3;
for (let i = 0; i < 10; i++) {
    let x = 'test in for';
}

// "ts-type-annotation-spacing"
class Test {}
let test1              :              Test;
let test2: Test;

