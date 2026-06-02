import { getTelemetry } from '@/platform/telemetry';

type RouteBoundaryPhase = 'beforeLoad' | 'loader';
type RouteBoundaryFn = (args: any) => any;

const isPromiseLike = <T>(value: T): value is T & Promise<Awaited<T>> =>
  value !== null &&
  value !== undefined &&
  typeof value === 'object' &&
  'then' in value &&
  typeof (value as { then?: unknown }).then === 'function';

const normalizeRouteTemplate = (routeId: string) =>
  routeId === '/' ? '/' : routeId.replace(/\/+$/, '');

const recordRouteBoundaryMetric = ({
  durationMs,
  phase,
  routeId,
  status,
}: {
  durationMs: number;
  phase: RouteBoundaryPhase;
  routeId: string;
  status: 'error' | 'success';
}) => {
  getTelemetry().recordMetric({
    attributes: {
      'route.id': routeId,
      'route.phase': phase,
      'route.template': normalizeRouteTemplate(routeId),
      status,
    },
    name: 'app.route.boundary.duration',
    type: 'histogram',
    unit: 'ms',
    value: durationMs,
  });
};

const runObservedRouteBoundary = <T>(
  routeId: string,
  phase: RouteBoundaryPhase,
  fn: () => T
): T => {
  const start = performance.now();
  const template = normalizeRouteTemplate(routeId);

  return getTelemetry().startSpan(
    {
      attributes: {
        'route.id': routeId,
        'route.phase': phase,
        'route.template': template,
      },
      name: `route.${phase} ${template}`,
      op: `router.${phase}`,
    },
    () => {
      try {
        const result = fn();
        if (!isPromiseLike(result)) {
          recordRouteBoundaryMetric({
            durationMs: performance.now() - start,
            phase,
            routeId,
            status: 'success',
          });
          return result;
        }

        return result
          .then((value) => {
            recordRouteBoundaryMetric({
              durationMs: performance.now() - start,
              phase,
              routeId,
              status: 'success',
            });
            return value;
          })
          .catch((error: unknown) => {
            recordRouteBoundaryMetric({
              durationMs: performance.now() - start,
              phase,
              routeId,
              status: 'error',
            });
            throw error;
          }) as T;
      } catch (error) {
        recordRouteBoundaryMetric({
          durationMs: performance.now() - start,
          phase,
          routeId,
          status: 'error',
        });
        throw error;
      }
    }
  );
};

export const observedBeforeLoad = <TBeforeLoad extends RouteBoundaryFn>(
  routeId: string,
  beforeLoad: TBeforeLoad
): TBeforeLoad =>
  ((args: Parameters<TBeforeLoad>[0]) =>
    runObservedRouteBoundary(routeId, 'beforeLoad', () =>
      beforeLoad(args)
    )) as TBeforeLoad;

export const observeBeforeLoad = <T>(routeId: string, fn: () => T): T =>
  runObservedRouteBoundary(routeId, 'beforeLoad', fn);

export const observedLoader = <TLoader extends RouteBoundaryFn>(
  routeId: string,
  loader: TLoader
): TLoader =>
  ((args: Parameters<TLoader>[0]) =>
    runObservedRouteBoundary(routeId, 'loader', () => loader(args))) as TLoader;

export const observeLoader = <T>(routeId: string, fn: () => T): T =>
  runObservedRouteBoundary(routeId, 'loader', fn);
