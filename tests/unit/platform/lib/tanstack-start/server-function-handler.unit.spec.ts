import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import {
  createNoOpTelemetry,
  setTelemetry,
  type TelemetryAdapter,
} from '@/platform/telemetry';

afterEach(() => {
  setTelemetry(createNoOpTelemetry());
});

describe('server function handler helpers', () => {
  it('loads deps, runs the selected context wrapper, and invokes the handler', async () => {
    type TestContext = { userId: string };
    const ctx: TestContext = { userId: 'user-1' };
    const runnerCalls = vi.fn();
    const runner: ServerFnContextRunner<TestContext> = async (fn) => {
      runnerCalls();
      return fn(ctx);
    };
    const getDeps = vi.fn(
      (): {
        runner: ServerFnContextRunner<TestContext>;
        value: string;
      } => ({ runner, value: 'dep' })
    );
    const invoke = createServerFunctionInvoker({
      getDeps,
      selectRunner: (deps) => deps.runner,
    });

    await expect(
      invoke({ id: 'item-1' }, (deps, context, data) =>
        Promise.resolve(`${deps.value}:${context.userId}:${data.id}`)
      )
    ).resolves.toBe('dep:user-1:item-1');

    expect(getDeps).toHaveBeenCalledOnce();
    expect(runnerCalls).toHaveBeenCalledOnce();
  });

  it('supports synchronous handlers', async () => {
    type TestContext = { userId: string };
    const ctx: TestContext = { userId: 'user-1' };
    const runnerCalls = vi.fn();
    const runner: ServerFnContextRunner<TestContext> = async (fn) => {
      runnerCalls();
      return fn(ctx);
    };
    const getDeps = vi.fn(() => ({ runner, value: 'dep' }));
    const invoke = createServerFunctionInvoker({
      getDeps,
      selectRunner: (deps) => deps.runner,
    });

    await expect(
      invoke(
        { id: 'item-1' },
        (deps, context, data) => `${deps.value}:${context.userId}:${data.id}`
      )
    ).resolves.toBe('dep:user-1:item-1');

    expect(getDeps).toHaveBeenCalledOnce();
    expect(runnerCalls).toHaveBeenCalledOnce();
  });

  it('propagates synchronous handler failures as rejections', async () => {
    type TestContext = { userId: string };
    const ctx: TestContext = { userId: 'user-1' };
    const runnerCalls = vi.fn();
    const runner: ServerFnContextRunner<TestContext> = async (fn) => {
      runnerCalls();
      return fn(ctx);
    };
    const getDeps = vi.fn(() => ({ runner, value: 'dep' }));
    const invoke = createServerFunctionInvoker({
      getDeps,
      selectRunner: (deps) => deps.runner,
    });

    await expect(
      invoke({ id: 'item-1' }, () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(getDeps).toHaveBeenCalledOnce();
    expect(runnerCalls).toHaveBeenCalledOnce();
  });

  it('wraps named operations in telemetry spans and metrics', async () => {
    type TestContext = { userId: string };
    const ctx: TestContext = { userId: 'user-1' };
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
      startSpan: vi.fn((_options, fn) => fn()),
    };
    setTelemetry(telemetry);
    const runner: ServerFnContextRunner<TestContext> = async (fn) => fn(ctx);
    const invoke = createServerFunctionInvoker({
      getDeps: () => ({ runner, value: 'dep' }),
      selectRunner: (deps) => deps.runner,
    }).withOperation('book.getAll');

    await expect(
      invoke({ id: 'item-1' }, (deps) => Promise.resolve(deps.value))
    ).resolves.toBe('dep');

    expect(telemetry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'book.getAll',
        op: 'server.function',
      }),
      expect.any(Function)
    );
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'operation.name': 'book.getAll',
          status: 'success',
        }),
        name: 'app.server_function.duration',
      })
    );
  });
});
