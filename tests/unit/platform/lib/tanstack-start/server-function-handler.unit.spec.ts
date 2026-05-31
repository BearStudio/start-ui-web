import { describe, expect, it, vi } from 'vitest';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

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
});
