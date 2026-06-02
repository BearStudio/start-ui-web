import { getTelemetry } from '@/platform/telemetry';
import type { TelemetrySpanHandle } from '@/platform/telemetry';

type RouterLifecycleEvent = {
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

const normalizePathname = (pathname: string) =>
  pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

const routeTemplateFromRouterState = (router: ObservableRouter) => {
  const routeId = router.state?.matches?.at(-1)?.routeId;
  return routeId ? normalizePathname(routeId) : undefined;
};

const routeTemplateFromPathname = (pathname: string) =>
  normalizePathname(pathname).replace(
    /\/(?:c[a-z0-9]{20,}|[0-9a-f]{8,})(?=\/|$)/gi,
    '/$id'
  );

const finishNavigation = (
  router: ObservableRouter,
  active: ActiveNavigation | undefined,
  event: RouterLifecycleEvent,
  status: 'rendered' | 'resolved'
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
      activeNavigation?.span.end();

      const routeTemplate = routeTemplateFromPathname(
        event.toLocation.pathname
      );
      activeNavigation = {
        href: event.toLocation.href,
        span: getTelemetry().startManualSpan({
          attributes: {
            'navigation.href': event.toLocation.href,
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
    activeNavigation = finishNavigation(
      router,
      activeNavigation,
      event,
      'resolved'
    );
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
