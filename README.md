# Babel fast traverse

Lightweight and fast traverser for Babel AST nodes, similar to traverseFast in 
the @babel/types package but adds replacement functionality similar to 
@babel/traverse without the overhead.

## Example

```javascript
import * as t from '@babel/types';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import fastTraverse from './index';

const ast = parse(`
    const message = 'Hello World';
    console.log(message);
`);

fastTraverse(ast, {
    enter(node: t.Node, parent: t.Node) {

        // example of replacing with a single node
        if (t.isStringLiteral(node) && node.value == 'Hello World') {
            return t.stringLiteral('Oh hello there');
        }

        // example of replacing with multiple nodes
        if (t.isExpressionStatement(node) && t.isCallExpression(node.expression)) {
            return [t.emptyStatement(), t.emptyStatement()];
        }
    }
});

const output = generate(ast).code;
console.log(output);
```

Output
```
const message = "Oh hello there";
;
;
```