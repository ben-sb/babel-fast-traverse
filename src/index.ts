import * as t from '@babel/types';

/**
 * Performs a fast traverse on an AST node.
 * @param node The AST node to traverse.
 * @param visitor The visitor object.
 * @param parent The parent AST node (internal use only).
 * @param parentKey The key the child is on the parent (internal use only).
 * @param visitedNodes The set of already visited nodes (internal use only).
 */
export default function fastTraverse(node: t.Node, visitor: TraversalVisitor, parent?: t.Node, parentKey?: string | [string, number], visitedNodes?: Set<t.Node>): void {
    if (!visitedNodes) {
        visitedNodes = new Set<t.Node>();
    }
    if (!node || visitedNodes.has(node)) {
        return;
    }
    visitedNodes.add(node);

    const replacement = visitor.enter(node, parent);
    if (replacement && parent && parentKey != undefined) {
        if (Array.isArray(replacement)) {
            if (replacement.length > 0) {
                if (typeof parentKey != 'string') {
                    (parent as any)[parentKey[0]].splice(parentKey[1], 1, ...replacement);
                }
                node = replacement[0];
            }
        } else {
            if (typeof parentKey == 'string') {
                (parent as any)[parentKey] = replacement;
            } else {
                (parent as any)[parentKey[0]][parentKey[1]] = replacement;
            }
            node = replacement;
        }
        
        return fastTraverse(node, visitor, parent, parentKey, visitedNodes);
    }

    if (visitor.skip) {
        visitor.skip = false;
        return;
    }
    if (visitor.break) {
        return;
    }
    
    const keys = t.VISITOR_KEYS[node.type];
    if (!keys) {
        return;
    }
    for (const key of keys) {
        const subNode = (node as any)[key];

        if (Array.isArray(subNode)) {
            for (let i=0; i<subNode.length; i++) {
                fastTraverse(subNode[i], visitor, node, [key, i], visitedNodes);
                if (visitor.break) {
                    return;
                }
            }
        } else {
            fastTraverse(subNode, visitor, node, key, visitedNodes);
        }

        if (visitor.break) {
            return;
        }
    }

    if (visitor.exit) {
        visitor.exit(node, parent);
    }
}

/**
 * TraversalVisitor is an interface for a visitor used during traversal.
 * The enter function is required and can return an array of nodes (similar
 * to path.replaceWithMultiple), a single node (similar to path.replace) or
 * void (which doesn't replace).
 */
interface TraversalVisitor {
    enter(node: t.Node, parent?: t.Node): t.Node[] | t.Node | void;
    exit?(node: t.Node, parent?: t.Node): void;
    skip?: boolean;
    break?: boolean;
}