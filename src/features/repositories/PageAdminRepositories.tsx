import React from 'react';

import {
  Button,
  Flex,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { Trans, useTranslation } from 'react-i18next';
import { LuBookMarked, LuPlus } from 'react-icons/lu';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListLoadingState,
  DataListRow,
  DataListText,
} from '@/components/DataList';
import { Icon } from '@/components/Icons';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SearchInput } from '@/components/SearchInput';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';
import { AdminRepositoryActions } from '@/features/repositories/AdminRepositoryActions';
import { ROUTES_REPOSITORIES } from '@/features/repositories/routes';
import { trpc } from '@/lib/trpc/client';

export default function PageAdminRepositories() {
  const { t } = useTranslation(['repositories']);
  const [searchTerm, setSearchTerm] = useQueryState('s', { defaultValue: '' });

  const repositories = trpc.repositories.getAll.useInfiniteQuery(
    { searchTerm },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <AdminLayoutPage>
      <AdminLayoutPageContent>
        <Stack spacing={4}>
          <HStack spacing={4} alignItems={{ base: 'end', md: 'center' }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              rowGap={2}
              columnGap={4}
              alignItems={{ base: 'start', md: 'center' }}
              flex={1}
            >
              <Heading flex="none" size="md">
                {t('repositories:list.title')}
              </Heading>
              <SearchInput
                value={searchTerm}
                size="sm"
                onChange={(value) => setSearchTerm(value || null)}
                maxW={{ base: 'none', md: '20rem' }}
              />
            </Flex>
            <ResponsiveIconButton
              as={Link}
              href={ROUTES_REPOSITORIES.admin.create()}
              variant="@primary"
              size="sm"
              icon={<LuPlus />}
            >
              {t('repositories:list.actions.createRepository')}
            </ResponsiveIconButton>
          </HStack>

          <DataList>
            {repositories.isLoading && <DataListLoadingState />}
            {repositories.isError && (
              <DataListErrorState
                title={t('repositories:feedbacks.loadingRepositoryError.title')}
                retry={() => repositories.refetch()}
              />
            )}
            {repositories.isSuccess &&
              !repositories.data.pages.flatMap((p) => p.items).length && (
                <DataListEmptyState searchTerm={searchTerm}>
                  {t('repositories:list.empty')}
                </DataListEmptyState>
              )}

            {repositories.data?.pages
              .flatMap((p) => p.items)
              .map((repository) => (
                <DataListRow as={LinkBox} key={repository.id} withHover>
                  <DataListCell w="auto">
                    <Icon icon={LuBookMarked} fontSize="xl" color="gray.400" />
                  </DataListCell>
                  <DataListCell>
                    <DataListText fontWeight="bold">
                      <LinkOverlay
                        as={Link}
                        href={ROUTES_REPOSITORIES.admin.repository({
                          id: repository.id,
                        })}
                      >
                        {repository.name}
                      </LinkOverlay>
                    </DataListText>
                    <DataListText color="text-dimmed">
                      {repository.link}
                    </DataListText>
                  </DataListCell>
                  <DataListCell flex={2} display={{ base: 'none', md: 'flex' }}>
                    <DataListText noOfLines={2} color="text-dimmed">
                      {repository.description}
                    </DataListText>
                  </DataListCell>
                  <DataListCell w="auto">
                    <AdminRepositoryActions repository={repository} />
                  </DataListCell>
                </DataListRow>
              ))}
            {repositories.isSuccess && (
              <DataListRow mt="auto">
                <DataListCell w="auto">
                  <Button
                    size="sm"
                    onClick={() => repositories.fetchNextPage()}
                    isLoading={repositories.isFetchingNextPage}
                    isDisabled={!repositories.hasNextPage}
                  >
                    {t('repositories:list.loadMore.button')}
                  </Button>
                </DataListCell>
                <DataListCell>
                  {repositories.isSuccess &&
                    !!repositories.data.pages[0]?.total && (
                      <Text fontSize="xs" color="text-dimmed">
                        <Trans
                          i18nKey="repositories:list.loadMore.display"
                          t={t}
                          values={{
                            loaded: repositories.data.pages.flatMap(
                              (p) => p.items
                            ).length,
                            total: repositories.data.pages[0].total,
                          }}
                        />
                      </Text>
                    )}
                </DataListCell>
              </DataListRow>
            )}
          </DataList>
        </Stack>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
