import { beforeEach, describe, expect, it } from 'vitest';

import { makeTestKernel } from '@tests/unit/composition/helpers';
import {
  __resetAccountComposition,
  __resetBookComposition,
  __resetGenreComposition,
  __resetKernelComposition,
  __resetUserComposition,
  getKernel,
  getServices,
  type ServicesOverrides,
} from '@/composition/index';
import type { Kernel, KernelOverrides } from '@/composition/kernel';

const _servicesOverridesRejectNestedKernel: ServicesOverrides = {
  book: {
    // @ts-expect-error service-level overrides must use the shared kernel.
    kernel: {} as Kernel,
  },
};

const resetComposition = () => {
  __resetKernelComposition();
  __resetBookComposition();
  __resetUserComposition();
  __resetGenreComposition();
  __resetAccountComposition();
};

describe('composition override contract', () => {
  beforeEach(() => {
    resetComposition();
  });

  it('treats direct empty kernel overrides as a fresh build', () => {
    const singleton = getKernel();
    const overridden = getKernel({});

    expect(getKernel()).toBe(singleton);
    expect(overridden).not.toBe(singleton);
    expect(overridden.cacheGateway).toBe(singleton.cacheGateway);
  });

  it('preserves the shared cache when only logger is overridden', async () => {
    const singleton = getKernel();
    const logger = makeTestKernel().logger;
    await singleton.cacheGateway.set('books:list', ['cached']);

    const overridden = getKernel({ logger });

    expect(overridden).not.toBe(singleton);
    expect(overridden.logger).toBe(logger);
    expect(overridden.cacheGateway).toBe(singleton.cacheGateway);
    await expect(overridden.cacheGateway.get('books:list')).resolves.toEqual([
      'cached',
    ]);
  });

  it('preserves defaults when kernel overrides contain explicit undefined', () => {
    const singleton = getKernel();
    const unsafeOverrides = {
      db: undefined,
      logger: undefined,
      clock: undefined,
      idGenerator: undefined,
      cacheGateway: undefined,
      transactionRunner: undefined,
      permissionChecker: undefined,
    } as unknown as KernelOverrides;

    const overridden = getKernel(unsafeOverrides);

    expect(overridden).not.toBe(singleton);
    expect(overridden.db).toBe(singleton.db);
    expect(overridden.logger).toBe(singleton.logger);
    expect(overridden.clock).toBe(singleton.clock);
    expect(overridden.idGenerator).toBe(singleton.idGenerator);
    expect(overridden.cacheGateway).toBe(singleton.cacheGateway);
    expect(overridden.transactionRunner).toBe(singleton.transactionRunner);
    expect(overridden.permissionChecker).toBe(singleton.permissionChecker);
  });

  it('builds an override cache from the override clock', async () => {
    let nowMs = 0;
    const clock = {
      now: () => new Date(nowMs),
    };
    const kernel = getKernel({ clock });

    await kernel.cacheGateway.set('short-lived', 'value', { ttlMs: 100 });
    nowMs = 99;
    await expect(kernel.cacheGateway.get('short-lived')).resolves.toBe('value');

    nowMs = 100;
    await expect(
      kernel.cacheGateway.get('short-lived')
    ).resolves.toBeUndefined();
  });

  it('uses singleton services with no overrides and fresh services with overrides', () => {
    const first = getServices();
    const second = getServices();
    const overridden = getServices({});

    expect(second.kernel).toBe(first.kernel);
    expect(second.book).toBe(first.book);
    expect(second.user).toBe(first.user);
    expect(second.genre).toBe(first.genre);
    expect(second.account).toBe(first.account);

    expect(overridden.kernel).not.toBe(first.kernel);
    expect(overridden.book).not.toBe(first.book);
    expect(overridden.user).not.toBe(first.user);
    expect(overridden.genre).not.toBe(first.genre);
    expect(overridden.account).not.toBe(first.account);
  });
});
