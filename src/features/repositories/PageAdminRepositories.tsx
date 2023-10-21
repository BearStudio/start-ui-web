import React from 'react';

import {
  Box,
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
import { useSearchParams } from 'next/navigation';
import { Trans, useTranslation } from 'react-i18next';
import { LuBookMarked, LuPlus } from 'react-icons/lu';

import {
  DataList,
  DataListCell,
  DataListEmptyState,
  DataListErrorState,
  DataListFooter,
  DataListLoadingState,
  DataListRow,
} from '@/components/DataList';
import { Icon } from '@/components/Icons';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SearchInput } from '@/components/SearchInput';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';
import { ADMIN_PATH } from '@/features/admin/constants';
import { AdminRepositoryActions } from '@/features/repositories/AdminRepositoryActions';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

export default function PageAdminRepositories() {
  const { t } = useTranslation(['repositories']);
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();
  const searchTerm = searchParams.get('s') ?? '';

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
                onChange={(value) => searchParamsUpdater({ s: value || null })}
                maxW={{ base: 'none', md: '20rem' }}
              />
            </Flex>
            <ResponsiveIconButton
              as={Link}
              href={`${ADMIN_PATH}/repositories/create`}
              variant="@primary"
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
                <DataListEmptyState searchTerm={searchTerm} />
              )}

            {repositories.data?.pages
              .flatMap((p) => p.items)
              .map((repository) => (
                <DataListRow as={LinkBox} key={repository.id}>
                  <DataListCell colWidth={1} colName="name">
                    <HStack maxW="100%">
                      <Icon
                        icon={LuBookMarked}
                        fontSize="xl"
                        color="gray.400"
                        marginX={1}
                      />
                      <Box minW="0">
                        <Text noOfLines={1} maxW="full" fontWeight="bold">
                          <LinkOverlay
                            as={Link}
                            href={`${ADMIN_PATH}/repositories/${repository.id}`}
                          >
                            {repository.name}
                          </LinkOverlay>
                        </Text>

                        <Text
                          noOfLines={1}
                          maxW="full"
                          fontSize="sm"
                          color="gray.600"
                          _dark={{ color: 'gray.300' }}
                          _hover={{ textDecoration: 'underline' }}
                        >
                          {repository.link}
                        </Text>
                      </Box>
                    </HStack>
                  </DataListCell>
                  <DataListCell
                    colWidth={1}
                    colName="description"
                    isVisible={{ base: false, md: true }}
                  >
                    <Text noOfLines={2} fontSize="sm">
                      {repository.description}
                    </Text>
                  </DataListCell>
                  <DataListCell colWidth="4rem" colName="actions">
                    <AdminRepositoryActions repository={repository} />
                  </DataListCell>
                </DataListRow>
              ))}
            {repositories.isSuccess && (
              <DataListFooter gap={3}>
                <Button
                  size="sm"
                  onClick={() => repositories.fetchNextPage()}
                  isLoading={repositories.isFetchingNextPage}
                  isDisabled={!repositories.hasNextPage}
                >
                  {t('repositories:list.loadMore.button')}
                </Button>
                <Box flex={1}>
                  {repositories.isSuccess &&
                    !!repositories.data.pages[0]?.total && (
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        _dark={{ color: 'gray.300' }}
                      >
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
                </Box>
              </DataListFooter>
            )}
          </DataList>
        </Stack>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
