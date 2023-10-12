import React from 'react';

import {
  Box,
  HStack,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
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
import {
  Pagination,
  PaginationButtonFirstPage,
  PaginationButtonLastPage,
  PaginationButtonNextPage,
  PaginationButtonPrevPage,
  PaginationInfo,
} from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
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
  const setSearchParams = useSearchParamsUpdater();
  const page = +(searchParams?.get('page') || 1);

  const pageSize = 20;
  const repositories = trpc.repositories.getAll.useQuery({
    page,
    size: pageSize,
  });

  return (
    <AdminLayoutPage containerSize="lg">
      <AdminLayoutPageContent>
        <HStack mb="4">
          <Heading size="md" flex={1}>
            {t('repositories:list.title')}
          </Heading>
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
          {repositories.isSuccess && !repositories.data.items.length && (
            <DataListEmptyState />
          )}
          {repositories.data?.items.map((repository) => (
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
          <DataListFooter>
            <Pagination
              isLoadingPage={repositories.isFetching}
              setPage={(newPage) => {
                setSearchParams({
                  page: newPage.toString(),
                });
              }}
              page={page}
              pageSize={pageSize}
              totalItems={repositories.data?.total}
            >
              <PaginationButtonFirstPage />
              <PaginationButtonPrevPage />
              <PaginationInfo flex="1" />
              <PaginationButtonNextPage />
              <PaginationButtonLastPage />
            </Pagination>
          </DataListFooter>
        </DataList>
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
