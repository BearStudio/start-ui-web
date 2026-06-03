import type { TelemetrySpanHandle } from '@/platform/telemetry';
import { getTelemetry } from '@/platform/telemetry';

type RouterLifecycleEvent = {
  fromLocation?: { href: string; pathname: string };
  hashChanged?: boolean;
  hrefChanged?: boolean;
  pathChanged?: boolean;
  toLocation: { href: string; pathname: string };
};

type ObservableRouter = {
  state?: {
    matches?: Array<{ routeId?: string }>;
  };
  subscribe: (
    eventType:
      | 'onBeforeNavigate'
      | 'onBeforeRouteMount'
      | 'onRendered'
      | 'onResolved',
    fn: (event: RouterLifecycleEvent) => void
  ) => () => void;
};

type ActiveNavigation = {
  href: string;
  span: TelemetrySpanHandle;
  start: number;
};

const normalizePathname = (pathname: string) => {
  let end = pathname.length;
  while (end > 1 && pathname.charCodeAt(end - 1) === 47) end -= 1;
  return pathname.slice(0, end);
};

const isAlphaNumeric = (charCode: number) =>
  (charCode >= 48 && charCode <= 57) ||
  (charCode >= 65 && charCode <= 90) ||
  (charCode >= 97 && charCode <= 122);

const isHex = (charCode: number) =>
  (charCode >= 48 && charCode <= 57) ||
  (charCode >= 65 && charCode <= 70) ||
  (charCode >= 97 && charCode <= 102);

const everyCharCode = (
  value: string,
  predicate: (charCode: number) => boolean
) => {
  for (let index = 0; index < value.length; index += 1) {
    if (!predicate(value.charCodeAt(index))) return false;
  }

  return true;
};

const isIdPathSegment = (segment: string) =>
  (segment.length >= 21 &&
    segment[0]?.toLowerCase() === 'c' &&
    everyCharCode(segment, isAlphaNumeric)) ||
  (segment.length >= 8 && everyCharCode(segment, isHex));

const routeTemplateFromRouterState = (router: ObservableRouter) => {
  const routeId = router.state?.matches?.at(-1)?.routeId;
  return routeId ? normalizePathname(routeId) : undefined;
};

const routeTemplateFromPathname = (pathname: string) =>
  normalizePathname(pathname)
    .split('/')
    .map((segment) => (isIdPathSegment(segment) ? '$id' : segment))
    .join('/');

const shouldTraceNavigation = (event: RouterLifecycleEvent) =>
  event.hrefChanged !== false &&
  !(event.hashChanged === true && event.pathChanged === false);

const finishNavigation = (
  router: ObservableRouter,
  active: ActiveNavigation | undefined,
  event: RouterLifecycleEvent,
  status: 'rendered'
) => {
  if (!active || active.href !== event.toLocation.href) return undefined;

  const durationMs = performance.now() - active.start;
  const routeTemplate =
    routeTemplateFromRouterState(router) ??
    routeTemplateFromPathname(event.toLocation.pathname);

  active.span.setAttributes({
    'navigation.duration_ms': durationMs,
    'navigation.status': status,
    'route.template': routeTemplate,
  });
  active.span.setStatus('ok');
  active.span.end();

  getTelemetry().recordMetric({
    attributes: {
      'navigation.status': status,
      'route.template': routeTemplate,
    },
    name: 'app.router.navigation.duration',
    type: 'histogram',
    unit: 'ms',
    value: durationMs,
  });

  return undefined;
};

export const attachRouterObservability = (router: ObservableRouter) => {
  let activeNavigation: ActiveNavigation | undefined;

  const unsubscribeBeforeNavigate = router.subscribe(
    'onBeforeNavigate',
    (event) => {
      if (!shouldTraceNavigation(event)) {
        activeNavigation?.span.end();
        activeNavigation = undefined;
        return;
      }

      activeNavigation?.span.end();

      const routeTemplate = routeTemplateFromPathname(
        event.toLocation.pathname
      );
      activeNavigation = {
        href: event.toLocation.href,
        span: getTelemetry().startManualSpan({
          attributes: {
            'navigation.href': event.toLocation.href,
            'navigation.hash_changed': event.hashChanged,
            'navigation.path_changed': event.pathChanged,
            ...(event.fromLocation
              ? { 'navigation.from': event.fromLocation.href }
              : {}),
            'route.template': routeTemplate,
          },
          name: `router.navigation ${routeTemplate}`,
          op: 'router.navigation',
        }),
        start: performance.now(),
      };
    }
  );

  const unsubscribeResolved = router.subscribe('onResolved', (event) => {
    if (!activeNavigation || activeNavigation.href !== event.toLocation.href) {
      return;
    }

    activeNavigation.span.addEvent('navigation.resolved');
  });

  const unsubscribeRendered = router.subscribe('onRendered', (event) => {
    activeNavigation = finishNavigation(
      router,
      activeNavigation,
      event,
      'rendered'
    );
  });

  return () => {
    activeNavigation?.span.end();
    unsubscribeBeforeNavigate();
    unsubscribeResolved();
    unsubscribeRendered();
  };
};
