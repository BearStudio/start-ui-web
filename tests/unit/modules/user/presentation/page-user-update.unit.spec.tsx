import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type UpdatedUser = {
  email: string;
  id: string;
  image: string | null;
  name: string;
  role: 'admin' | 'user';
};

const pageMocks = vi.hoisted(() => ({
  mutationOptions: undefined as
    | { onSuccess: (data: UpdatedUser) => Promise<void> }
    | undefined,
  navigateBack: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn(async () => undefined),
    setQueryData: vi.fn(),
  },
  router: {
    invalidate: vi.fn(async () => undefined),
  },
  session: {
    data: {
      user: {
        id: 'current-user',
      },
    },
    refetch: vi.fn(async () => undefined),
  },
  toastError: vi.fn(),
}));

vi.mock('@tanstack/react-form', () => ({
  useStore: () => false,
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: {
    onSuccess: (data: UpdatedUser) => Promise<void>;
  }) => {
    pageMocks.mutationOptions = options;

    return {
      isPending: false,
      mutateAsync: vi.fn(async () => undefined),
    };
  },
  useQuery: () => ({
    data: {
      email: 'admin@example.com',
      id: 'user-1',
      image: null,
      name: 'Admin User',
      role: 'admin',
    },
    status: 'success',
  }),
  useQueryClient: () => pageMocks.queryClient,
}));

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => pageMocks.router,
}));

vi.mock('lucide-react', () => ({
  AlertCircleIcon: () => null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: pageMocks.toastError,
  },
}));

vi.mock('@/platform/hooks/use-navigate-back', () => ({
  useNavigateBack: () => ({ navigateBack: pageMocks.navigateBack }),
}));

vi.mock('@/platform/components/back-button', () => ({
  BackButton: () => null,
}));

vi.mock('@/platform/components/form', () => ({
  Form: (props: { children?: ReactNode }) => props.children,
  useAppForm: () => ({
    setFieldMeta: vi.fn(),
    store: {},
  }),
}));

vi.mock('@/platform/components/page-layout', () => ({
  ManagerPageLayout: (props: { children?: ReactNode }) => props.children,
  ManagerPageLayoutContent: (props: { children?: ReactNode }) => props.children,
  ManagerPageLayoutTopBar: (props: { children?: ReactNode }) => props.children,
  ManagerPageLayoutTopBarTitle: (props: { children?: ReactNode }) =>
    props.children,
}));

vi.mock('@/platform/components/prevent-navigation', () => ({
  PreventNavigation: () => null,
}));

vi.mock('@/platform/components/ui/button', () => ({
  Button: () => null,
}));

vi.mock('@/platform/components/ui/card', () => ({
  Card: (props: { children?: ReactNode }) => props.children,
  CardContent: (props: { children?: ReactNode }) => props.children,
}));

vi.mock('@/platform/components/ui/skeleton', () => ({
  Skeleton: () => null,
}));

vi.mock('@/modules/auth/client', () => ({
  authQueries: {
    currentSession: () => ({ queryKey: ['auth', 'v1', 'currentSession'] }),
  },
  useAuthSession: () => pageMocks.session,
  useCurrentScopeKey: () => 'scope-a',
}));

vi.mock('@/modules/kernel/client', () => ({
  isServerFnError: () => false,
}));

vi.mock('@/modules/user/client', () => ({
  userQueries: {
    getAll: (scopeKey: string) => ['user', 'v1', { scopeKey }, 'getAll'],
    getById: (input: { id: string; scopeKey: string }) => ({
      queryKey: ['user', 'v1', { scopeKey: input.scopeKey }, 'getById', input],
    }),
    updateById: () => ({
      mutationKey: ['user', 'v1', 'updateById'],
      mutationFn: vi.fn(async () => undefined),
    }),
  },
}));

vi.mock('@/modules/user/presentation/manager/form-user', () => ({
  formUserDefaultValues: (values?: unknown) => values ?? {},
  formUserValidators: {},
  FormUser: () => null,
}));

import { PageUserUpdate } from '@/modules/user/presentation/manager/page-user-update';

beforeEach(() => {
  pageMocks.mutationOptions = undefined;
  pageMocks.navigateBack.mockClear();
  pageMocks.queryClient.invalidateQueries.mockClear();
  pageMocks.queryClient.setQueryData.mockClear();
  pageMocks.router.invalidate.mockClear();
  pageMocks.session.refetch.mockClear();
  pageMocks.toastError.mockClear();
});

describe('PageUserUpdate', () => {
  it('writes the updated user into detail cache before invalidating and navigating back', async () => {
    const updatedUser = {
      email: 'admin@example.com',
      id: 'user-1',
      image: null,
      name: 'Updated Admin',
      role: 'admin',
    } satisfies UpdatedUser;

    renderToStaticMarkup(
      createElement(PageUserUpdate, { params: { id: 'user-1' } })
    );

    expect(pageMocks.mutationOptions).toEqual(
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    const mutationOptions = pageMocks.mutationOptions as NonNullable<
      typeof pageMocks.mutationOptions
    >;

    await mutationOptions.onSuccess(updatedUser);

    const detailQueryKey = [
      'user',
      'v1',
      { scopeKey: 'scope-a' },
      'getById',
      { id: 'user-1', scopeKey: 'scope-a' },
    ];
    expect(pageMocks.queryClient.setQueryData).toHaveBeenCalledWith(
      detailQueryKey,
      updatedUser
    );
    expect(pageMocks.queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: detailQueryKey,
    });
    expect(pageMocks.queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user', 'v1', { scopeKey: 'scope-a' }, 'getAll'],
      type: 'all',
    });
    const setQueryDataOrder = pageMocks.queryClient.setQueryData.mock
      .invocationCallOrder[0] as number;
    const invalidateOrders =
      pageMocks.queryClient.invalidateQueries.mock.invocationCallOrder;
    const firstInvalidateOrder = invalidateOrders[0] as number;

    expect(setQueryDataOrder).toBeLessThan(firstInvalidateOrder);
    expect(pageMocks.navigateBack).toHaveBeenCalledWith({
      ignoreBlocker: true,
    });
    const lastInvalidateOrder = invalidateOrders[
      invalidateOrders.length - 1
    ] as number;
    const navigateBackOrder = pageMocks.navigateBack.mock
      .invocationCallOrder[0] as number;

    expect(lastInvalidateOrder).toBeLessThan(navigateBackOrder);
    expect(pageMocks.session.refetch).not.toHaveBeenCalled();
    expect(pageMocks.router.invalidate).not.toHaveBeenCalled();
  });
});
