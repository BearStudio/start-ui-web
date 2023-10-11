import React from 'react';

import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  HStack,
  Heading,
  IconButton,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuExternalLink, LuPenLine, LuTrash2 } from 'react-icons/lu';

import { ConfirmModal } from '@/components/ConfirmModal';
import { ErrorPage } from '@/components/ErrorPage';
import { Icon } from '@/components/Icons';
import { LoaderFull } from '@/components/LoaderFull';
import { Page, PageContent, PageTopBar } from '@/components/Page';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { useToastError } from '@/components/Toast';
import { ADMIN_PATH } from '@/features/admin/constants';
import { trpc } from '@/lib/trpc/client';

export default function PageAdminRepository() {
  const { t } = useTranslation(['common', 'repositories']);

  const toastError = useToastError();

  const router = useRouter();
  const params = useParams();
  const repository = trpc.repositories.getById.useQuery({
    id: params?.id?.toString() ?? '',
  });
  const repositoryRemove = trpc.repositories.removeById.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: () => {
      toastError({
        title: t('repositories:feedbacks.deleteRepositoryError.title'),
        description: t(
          'repositories:feedbacks.deleteRepositoryError.description'
        ),
      });
    },
  });

  return (
    <Page containerSize="lg">
      <PageTopBar zIndex={0} showBack onBack={() => router.back()}>
        <HStack>
          <Box flex={1}>
            {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
            {repository.isSuccess && (
              <Heading size="md">{repository.data?.name}</Heading>
            )}
          </Box>
          <ButtonGroup>
            <ResponsiveIconButton
              as={Link}
              href={`${ADMIN_PATH}/repositories/${params?.id}/update`}
              icon={<LuPenLine />}
            >
              {t('common:actions.edit')}
            </ResponsiveIconButton>

            <ConfirmModal
              title={t('repositories:deleteModal.title')}
              message={t('repositories:deleteModal.message', {
                name: repository.data?.name,
              })}
              onConfirm={() =>
                repository.data &&
                repositoryRemove.mutate({
                  id: repository.data.id,
                })
              }
              confirmText={t('common:actions.delete')}
              confirmVariant="@danger"
              size="sm"
            >
              <IconButton
                aria-label={t('common:actions.delete')}
                icon={<LuTrash2 />}
                isDisabled={!repository.data}
                isLoading={repositoryRemove.isLoading}
              />
            </ConfirmModal>
          </ButtonGroup>
        </HStack>
      </PageTopBar>
      <PageContent>
        {repository.isLoading && <LoaderFull />}
        {repository.isError && <ErrorPage />}
        {repository.isSuccess && (
          <Card>
            <CardBody>
              <Stack spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {t('repositories:data.name.label')}
                  </Text>
                  <Text>{repository.data?.name}</Text>
                </Box>
                <Box
                  role="group"
                  as="a"
                  href={repository.data?.link}
                  target="_blank"
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {t('repositories:data.link.label')}
                    <Icon marginLeft={1} icon={LuExternalLink} />
                  </Text>

                  <Text _groupHover={{ textDecoration: 'underline' }}>
                    {repository.data?.link}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {t('repositories:data.description.label')}
                  </Text>
                  <Text>
                    {repository.data?.description || <small>-</small>}
                  </Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        )}
      </PageContent>
    </Page>
  );
}
