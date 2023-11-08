import React from 'react';

import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Link,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { AppLayoutPage } from '@/features/app/AppLayoutPage';
import { trpc } from '@/lib/trpc/client';

export default function PageRepositories() {
  const { t } = useTranslation(['repositories']);

  const repositories = trpc.repositories.getAll.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <AppLayoutPage>
      <Stack flex={1} spacing={4}>
        <Heading size="md">{t('repositories:list.title')}</Heading>

        {repositories.isLoading && <LoaderFull />}
        {repositories.isError && <ErrorPage />}

        {repositories.isSuccess &&
          !repositories.data.pages.flatMap((p) => p.items).length && (
            <Text fontSize="sm" color="text-dimmed">
              {t('repositories:list.empty')}
            </Text>
          )}

        {repositories.isSuccess &&
          repositories.data.pages
            .flatMap((p) => p.items)
            .map((repository) => (
              <Card as={LinkBox} key={repository.id} shadow="card">
                <CardBody>
                  <Stack>
                    <Heading size="sm">{repository.name}</Heading>
                    {!!repository.description && (
                      <Text fontSize="sm">{repository.description}</Text>
                    )}
                    <Link
                      as={LinkOverlay}
                      href={repository.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      fontSize="sm"
                    >
                      {repository.link}
                    </Link>
                  </Stack>
                </CardBody>
              </Card>
            ))}
        {repositories.hasNextPage && (
          <Box>
            <Button
              onClick={() => repositories.fetchNextPage()}
              isLoading={repositories.isFetchingNextPage}
            >
              {t('repositories:list.loadMore.button')}
            </Button>
          </Box>
        )}
      </Stack>
    </AppLayoutPage>
  );
}
