/**
 * @name Untrusted data reaches a sensitive sink
 * @description User-controlled data from server functions, route search params, requests, uploads, or headers should not reach redirects, HTML, SQL-like patterns, logs, storage keys, or provider-token sinks without an approved barrier.
 * @kind path-problem
 * @problem.severity warning
 * @precision medium
 * @id start-ui-web/untrusted-data-to-sensitive-sink
 * @tags security
 *       external/cwe/cwe-079
 *       external/cwe/cwe-089
 *       external/cwe/cwe-200
 *       external/cwe/cwe-601
 */

import javascript

private predicate isAnalyzedFile(File file) {
  file.getRelativePath().regexpMatch("src/.+") or
  file.getRelativePath().regexpMatch(".*untrusted-data-to-sensitive-sink\\.ts")
}

private predicate isRouteSearchSourceFile(File file) {
  file.getRelativePath().regexpMatch("src/routes/.+") or
  file.getRelativePath().regexpMatch(".*untrusted-data-to-sensitive-sink\\.ts")
}

private predicate isApprovedBarrierName(string name) {
  name = "parseSafeRedirectPath" or
  name = "normalizeInternalRedirect" or
  name = "normalizeRedirectForSearch" or
  name = "sanitizeCurrentSession" or
  name = "sanitizeLogFields" or
  name = "escapeLikePattern" or
  name = "escapedLikePattern" or
  name = "escapedIlikeFilter" or
  name = "prepareCoverUpload" or
  name = "render"
}

private predicate isApprovedBarrierNode(DataFlow::Node node) {
  exists(CallExpr call |
    node = DataFlow::exprNode(call) and
    isApprovedBarrierName(call.getCalleeName())
  )
  or
  exists(MethodCallExpr call |
    node = DataFlow::exprNode(call) and
    isApprovedBarrierName(call.getMethodName())
  )
}

private predicate expressionHasAstName(Expr expr, string name) {
  exists(VarAccess access |
    access = expr.getUnderlyingReference() and
    access.getName() = name
  )
  or
  exists(PropAccess access |
    access = expr.getUnderlyingReference() and
    access.getPropertyName() = name
  )
}

private predicate isSearchExpr(Expr expr) {
  expressionHasAstName(expr, "search")
}

private predicate isRequestExpr(Expr expr) {
  exists(string name |
    expressionHasAstName(expr, name) and
    name.toLowerCase() in ["request", "req"]
  )
}

private predicate isUploadOrFileExpr(Expr expr) {
  exists(string name |
    expressionHasAstName(expr, name) and
    name.toLowerCase() in ["file", "upload", "blob", "cover"]
  )
}

private predicate isServerFunctionDataSource(DataFlow::Node node) {
  exists(Parameter param |
    node = DataFlow::parameterNode(param) and
    isAnalyzedFile(param.getFile()) and
    param.getName() = "data"
  )
}

private predicate isSearchParamSource(DataFlow::Node node) {
  exists(PropAccess access |
    node = DataFlow::exprNode(access) and
    isAnalyzedFile(access.getFile()) and
    (
      access.getPropertyName() = "search" and
      isRouteSearchSourceFile(access.getFile())
      or
      access.getPropertyName() = "redirect" and
      isSearchExpr(access.getBase())
    )
  )
  or
  exists(Parameter param |
    node = DataFlow::parameterNode(param) and
    isRouteSearchSourceFile(param.getFile()) and
    param.getName() = "search"
  )
}

private predicate isRequestUrlSource(DataFlow::Node node) {
  exists(PropAccess access |
    node = DataFlow::exprNode(access) and
    isAnalyzedFile(access.getFile()) and
    access.getPropertyName() = "url" and
    isRequestExpr(access.getBase())
  )
}

private predicate isUploadOrHeaderSource(DataFlow::Node node) {
  exists(PropAccess access |
    node = DataFlow::exprNode(access) and
    isAnalyzedFile(access.getFile()) and
    (
      access.getPropertyName() in ["headers", "metadata"] or
      (
        access.getPropertyName() in ["type", "name"] and
        isUploadOrFileExpr(access.getBase())
      )
    )
  )
}

private predicate isRedirectSink(DataFlow::Node node) {
  exists(CallExpr call |
    call.getCalleeName() = "redirect" and
    node = DataFlow::exprNode(call.getAnArgument())
  )
  or
  exists(CallExpr call, ObjectExpr options, Property property |
    call.getCalleeName() = "redirect" and
    options = call.getAnArgument() and
    property = options.getAProperty() and
    node = DataFlow::exprNode(property.getInit())
  )
}

private predicate isHtmlResponseSink(DataFlow::Node node) {
  exists(NewExpr response, ObjectExpr options, Property headers, Property contentType |
    response.getCalleeName() = "Response" and
    node = DataFlow::exprNode(response.getArgument(0)) and
    options = response.getArgument(1) and
    headers = options.getPropertyByName("headers") and
    contentType = headers.getInit().(ObjectExpr).getAProperty() and
    contentType.getName().toLowerCase() = "content-type" and
    contentType.getInit().getStringValue().regexpMatch("text/html.*")
  )
}

private predicate isHtmlDomSink(DataFlow::Node node) {
  exists(JsxAttribute attr |
    attr.getName() = "dangerouslySetInnerHTML" and
    node = DataFlow::exprNode(attr.getValue())
  )
  or
  exists(Assignment assign, PropAccess access |
    access = assign.getLhs() and
    access.getPropertyName() in ["innerHTML", "outerHTML"] and
    node = DataFlow::exprNode(assign.getRhs())
  )
  or
  exists(MethodCallExpr call |
    call.getMethodName() = "insertAdjacentHTML" and
    node = DataFlow::exprNode(call.getArgument(1))
  )
}

private predicate isSqlLikeSink(DataFlow::Node node) {
  exists(CallExpr call |
    call.getCalleeName() in ["like", "ilike", "sql"] and
    node = DataFlow::exprNode(call.getAnArgument())
  )
}

private predicate isLogSink(DataFlow::Node node) {
  exists(MethodCallExpr call |
    call.getMethodName() in ["debug", "info", "warn", "error", "log"] and
    node = DataFlow::exprNode(call.getAnArgument())
  )
}

private predicate isProviderTokenSink(DataFlow::Node node) {
  exists(Property property |
    property.getName() in ["sessionToken", "providerSessionToken", "providerToken"] and
    node = DataFlow::exprNode(property.getInit())
  )
}

private predicate isStorageKeySink(DataFlow::Node node) {
  exists(Property property |
    property.getName() in ["key", "objectKey"] and
    node = DataFlow::exprNode(property.getInit())
  )
}

module StartUiWebTaintConfig implements DataFlow::ConfigSig {
  predicate isSource(DataFlow::Node source) {
    isServerFunctionDataSource(source) or
    isSearchParamSource(source) or
    isRequestUrlSource(source) or
    isUploadOrHeaderSource(source)
  }

  predicate isSink(DataFlow::Node sink) {
    not isApprovedBarrierNode(sink) and
    (
      isRedirectSink(sink) or
      isHtmlResponseSink(sink) or
      isHtmlDomSink(sink) or
      isSqlLikeSink(sink) or
      isLogSink(sink) or
      isProviderTokenSink(sink) or
      isStorageKeySink(sink)
    )
  }

  predicate isBarrier(DataFlow::Node node) {
    isApprovedBarrierNode(node)
  }
}

module StartUiWebTaintFlow = TaintTracking::Global<StartUiWebTaintConfig>;

import StartUiWebTaintFlow::PathGraph

from StartUiWebTaintFlow::PathNode source, StartUiWebTaintFlow::PathNode sink
where StartUiWebTaintFlow::flowPath(source, sink)
select sink.getNode(), source, sink, "Untrusted data reaches this sensitive sink."
