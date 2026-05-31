/**
 * @name Privileged server function missing protected runner
 * @description Exported TanStack server functions should use the protected context or mutation runner unless they are explicitly public.
 * @kind problem
 * @problem.severity error
 * @precision high
 * @id start-ui-web/unprotected-server-function
 * @tags security
 *       external/cwe/cwe-862
 */

import javascript

private predicate isServerEntrypoint(File file) {
  file.getRelativePath().regexpMatch("src/modules/.+/(server|server-functions)\\.ts") or
  file.getRelativePath().regexpMatch("src/modules/.+/transport/server-functions/.+\\.ts") or
  file.getRelativePath().regexpMatch(".*unprotected-server-function\\.ts")
}

private predicate isPublicServerFunction(string name) {
  name = "configEnv" or
  name = "currentSession" or
  name = "initSsrApp"
}

private predicate isCreateServerFnChain(Expr expr) {
  exists(CallExpr call |
    call = expr.getAChild*() and
    call.getCalleeName() = "createServerFn"
  )
}

private predicate isProtectedRunnerName(string name) {
  name = "withProtectedContext" or
  name = "withProtectedMutation" or
  name = "runProtected" or
  name = "runMutation"
}

private predicate usesProtectedRunner(Expr expr) {
  exists(CallExpr call |
    call = expr.getAChild*() and
    isProtectedRunnerName(call.getCalleeName())
  )
}

from ExportDeclaration export, Variable variable, Expr assigned
where
  export.exportsDirectlyAs(variable, variable.getName()) and
  isServerEntrypoint(export.getFile()) and
  not isPublicServerFunction(variable.getName()) and
  assigned = variable.getAnAssignedExpr() and
  isCreateServerFnChain(assigned) and
  not usesProtectedRunner(assigned)
select assigned,
  "Exported server function '" + variable.getName() +
    "' is not routed through a protected server-function runner."
