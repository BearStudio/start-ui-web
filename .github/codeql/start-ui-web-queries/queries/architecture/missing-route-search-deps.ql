/**
 * @name Route reads search params without matching loaderDeps
 * @description Route loaders that use search-derived data must declare loaderDeps so TanStack Router query keys include the same normalized values.
 * @kind problem
 * @problem.severity warning
 * @precision high
 * @id start-ui-web/missing-route-search-deps
 * @tags maintainability
 *       correctness
 */

import javascript

predicate isRouteFile(File file) {
  file.getRelativePath().regexpMatch("src/routes/.+\\.(ts|tsx)") or
  file.getRelativePath().regexpMatch(".*missing-route-search-deps\\.tsx")
}

predicate objectHasProperty(ObjectExpr object, string name) {
  exists(Property property |
    property = object.getAProperty() and
    property.getName() = name
  )
}

private predicate isLoaderFunction(Property loader, Function loaderFn) {
  loaderFn = loader.getInit().(FunctionExpr)
  or
  loaderFn = loader.getInit().(ArrowFunctionExpr)
  or
  exists(VarAccess access |
    access = loader.getInit().getUnderlyingReference() and
    loaderFn = access.getVariable().getAnAssignedExpr().(Function)
  )
  or
  exists(VarAccess access |
    access = loader.getInit().getUnderlyingReference() and
    loaderFn.getVariable() = access.getVariable()
  )
}

private predicate loaderParameterDestructuresSearch(Function loaderFn) {
  exists(loaderFn.getParameter(0).(ObjectPattern).getPropertyPatternByName("search"))
}

private predicate accessReadsSearchFromLoaderContext(Function loaderFn, PropAccess access) {
  exists(VarAccess contextAccess |
    access = loaderFn.getBody().getAChild*() and
    access.getPropertyName() = "search" and
    contextAccess = access.getBase().getUnderlyingReference() and
    contextAccess.getVariable() = loaderFn.getParameter(0).getAVariable()
  )
}

predicate readsSearch(Property loader) {
  exists(Function loaderFn |
    isLoaderFunction(loader, loaderFn) and
    (
      accessReadsSearchFromLoaderContext(loaderFn, _) or
      loaderParameterDestructuresSearch(loaderFn)
    )
  )
}

from ObjectExpr routeConfig, Property loader
where
  isRouteFile(routeConfig.getFile()) and
  loader = routeConfig.getPropertyByName("loader") and
  readsSearch(loader) and
  (
    not objectHasProperty(routeConfig, "validateSearch") or
    not objectHasProperty(routeConfig, "loaderDeps")
  )
select loader,
  "This route loader reads search params but the route config does not declare both validateSearch and loaderDeps."
