# Babel fast traverse

Lightweight and fast traverser for Babel AST nodes, similar to traverseFast in 
the @babel/types package but adds replacement functionality similar to 
@babel/traverse without the overhead.

## Example

```typescript
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
    },
    exit(node: t.Node, parent: t.Node) {
        
    }
});

const output = generate(ast).code;
console.log(output);
```

Output
```javascript
const message = "Oh hello there";
;
;
```

## Visitor
The visitor interface:

```typescript
interface TraversalVisitor {
    enter(node: t.Node, parent?: t.Node): t.Node[] | t.Node | void;
    exit?(node: t.Node, parent?: t.Node): void;
    skip?: boolean;
    break?: boolean;
}
```

The skip and break properties can be set to prevent further traversal of the current node (skip) or to stop traversing altogether (break).
An example of this:

```typescript
fastTraverse(ast, {
    enter(node: t.Node) {
        // skips further traversal of the current node and its children
        this.skip = true;

        // stops traversing altogether
        this.break = true;
    },
    exit(node: t.Node, parent: t.Node) {
        
    }
});
```