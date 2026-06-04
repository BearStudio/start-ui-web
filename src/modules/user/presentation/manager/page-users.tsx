import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';

import { cn } from '@/platform/lib/tailwind/utils';

import {
  ManagerPageLayout as PageLayout,
  ManagerPageLayoutContent as PageLayoutContent,
  ManagerPageLayoutTopBar as PageLayoutTopBar,
  ManagerPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/platform/components/page-layout';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/platform/components/ui/avatar';
import { Badge } from '@/platform/components/ui/badge';
import { Button } from '@/platform/components/ui/button';
import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListRowResults,
  DataListText,
} from '@/platform/components/ui/datalist';
import { ResponsiveIconButtonLink } from '@/platform/components/ui/responsive-icon-button-link';
import { SearchButton } from '@/platform/components/ui/search-button';
import { SearchInput } from '@/platform/components/ui/search-input';

import { useCurrentScopeKey } from '@/modules/auth/client';
import { userQueries } from '@/modules/user/client';

export const PageUsers = (props: { search: { searchTerm?: string } }) => {
  const { t } = useTranslation(['user']);
  const router = useRouter();
  const scopeKey = useCurrentScopeKey();

  const searchInputProps = {
    value: props.search.searchTerm ?? '',
    onChange: (value: string) =>
      router.navigate({
        to: '.',
        search: { searchTerm: value },
        replace: true,
      }),
  };

  const usersQuery = useInfiniteQuery(
    userQueries.getAllInfinite({
      scopeKey,
      searchTerm: props.search.searchTerm,
    })
  );

  const searchTerm = props.search.searchTerm;
  const items = usersQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const total = usersQuery.data?.pages[0]?.total ?? 0;
  const ui = getUiState((set) =>
    match([usersQuery.status, items.length, Boolean(searchTerm)] as const)
      .with(['pending', P._, P._], () => set('pending'))
      .with(['error', P._, P._], () => set('error'))
      .with(['success', 0, true], () =>
        set('empty-search', { searchTerm: searchTerm ?? '' })
      )
      .with(['success', 0, false], () => set('empty'))
      .with(['success', P._, P._], () =>
        set('default', {
          items,
          searchTerm,
          total,
        })
      )
      .exhaustive()
  );

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveIconButtonLink
            label={t('user:manager.list.newButton')}
            variant="secondary"
            size="sm"
            to="/manager/users/new"
          >
            <PlusIcon />
          </ResponsiveIconButtonLink>
        }
      >
        <PageLayoutTopBarTitle>
          {t('user:manager.list.title')}
        </PageLayoutTopBarTitle>
        <SearchButton
          {...searchInputProps}
          className="-mx-2 md:hidden"
          size="icon-sm"
        />
        <SearchInput
          {...searchInputProps}
          size="sm"
          className="max-w-2xs max-md:hidden"
        />
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
        <DataList>
          {ui
            .match('pending', () => <DataListLoadingState />)
            .match('error', () => (
              <DataListErrorState retry={() => usersQuery.refetch()} />
            ))
            .match('empty', () => <DataListEmptyState />)
            .match('empty-search', ({ searchTerm }) => (
              <DataListEmptyState searchTerm={searchTerm} />
            ))
            .match('default', ({ items, searchTerm, total }) => (
              <>
                {!!searchTerm && (
                  <DataListRowResults
                    withClearButton
                    onClear={() => {
                      void router.navigate({
                        to: '.',
                        search: { searchTerm: '' },
                        replace: true,
                      });
                    }}
                  >
                    {t('user:manager.list.searchResults', {
                      total,
                      searchTerm,
                    })}
                  </DataListRowResults>
                )}
                {items.map((item) => (
                  <DataListRow key={item.id} withHover>
                    <DataListCell className="flex-none">
                      <Avatar>
                        <AvatarImage
                          src={item.image ?? undefined}
                          alt={item.name ?? ''}
                        />
                        <AvatarFallback
                          variant="boring"
                          name={item.name ?? ''}
                        />
                      </Avatar>
                    </DataListCell>
                    <DataListCell>
                      <DataListText className="font-medium">
                        <Link to="/manager/users/$id" params={{ id: item.id }}>
                          {item.name}
                          <span className="absolute inset-0" />
                        </Link>
                      </DataListText>
                      <DataListText className="text-xs text-muted-foreground">
                        {item.email}
                      </DataListText>
                    </DataListCell>
                    <DataListCell className="flex-[0.5] max-sm:hidden">
                      <Badge
                        variant={
                          item.role === 'admin' ? 'default' : 'secondary'
                        }
                      >
                        {item.role ?? '-'}
                      </Badge>
                    </DataListCell>
                    <DataListCell className="flex-[0.5] max-sm:hidden">
                      <DataListText
                        className={cn(
                          'text-xs text-muted-foreground',
                          !item.onboardedAt && 'opacity-60'
                        )}
                      >
                        {item.onboardedAt ? (
                          <>
                            {t('user:common.onboardingStatus.onboardedAt', {
                              time: dayjs(item.onboardedAt).fromNow(),
                            })}
                          </>
                        ) : (
                          t('user:common.onboardingStatus.notOnboarded')
                        )}
                      </DataListText>
                    </DataListCell>
                  </DataListRow>
                ))}
                <DataListRow>
                  <DataListCell className="flex-none">
                    <Button
                      size="xs"
                      variant="secondary"
                      disabled={!usersQuery.hasNextPage}
                      onClick={() => usersQuery.fetchNextPage()}
                      loading={usersQuery.isFetchingNextPage}
                    >
                      {t('user:manager.list.loadMore')}
                    </Button>
                  </DataListCell>
                  <DataListCell>
                    <DataListText className="text-xs text-muted-foreground">
                      {t('user:manager.list.showing', {
                        count: items.length,
                        total,
                      })}
                    </DataListText>
                  </DataListCell>
                </DataListRow>
              </>
            ))
            .exhaustive()}
        </DataList>
      </PageLayoutContent>
    </PageLayout>
  );
};
