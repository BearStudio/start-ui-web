/**
 * @name Dangerous HTML or code execution API
 * @description React and DOM APIs that interpret strings as HTML or code need explicit review and sanitization.
 * @kind problem
 * @problem.severity warning
 * @precision high
 * @id start-ui-web/react-dangerous-html-api
 * @tags security
 *       external/cwe/cwe-079
 *       external/cwe/cwe-094
 */

import javascript

from AstNode node, string api
where
  exists(JsxAttribute attr |
    node = attr and
    api = "dangerouslySetInnerHTML" and
    attr.getName() = api
  )
  or
  exists(Assignment assign, PropAccess access |
    node = access and
    api = access.getPropertyName() and
    api in ["innerHTML", "outerHTML"] and
    access = assign.getLhs()
  )
  or
  exists(MethodCallExpr call |
    node = call and
    api = "insertAdjacentHTML" and
    call.getMethodName() = api
  )
  or
  exists(CallExpr call |
    node = call and
    api = "eval" and
    call.getCalleeName() = api
  )
  or
  exists(NewExpr expr |
    node = expr and
    api = "Function" and
    expr.getCalleeName() = api
  )
select node, "Use of '" + api + "' should have an explicit sanitizer or documented exception."
