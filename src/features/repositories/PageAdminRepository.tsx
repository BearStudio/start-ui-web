import React from 'react';

import {
  Box,
  Card,
  CardBody,
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
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { toastCustom } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { ROUTES_REPOSITORIES } from '@/features/repositories/routes';
import { trpc } from '@/lib/trpc/client';

export default function PageAdminRepository() {
  const { t } = useTranslation(['common', 'repositories']);

  const trpcUtils = trpc.useUtils();

  const router = useRouter();
  const params = useParams();
  const repository = trpc.repositories.getById.useQuery({
    id: params?.id?.toString() ?? '',
  });

  const repositoryRemove = trpc.repositories.removeById.useMutation({
    onSuccess: async () => {
      await trpcUtils.repositories.getAll.invalidate();
      router.replace(ROUTES_REPOSITORIES.admin.root());
    },
    onError: () => {
      toastCustom({
        status: 'error',
        title: t('repositories:feedbacks.deleteRepositoryError.title'),
        description: t(
          'repositories:feedbacks.deleteRepositoryError.description'
        ),
      });
    },
  });

  return (
    <AdminLayoutPage showNavBar="desktop" containerMaxWidth="container.md">
      <AdminLayoutPageTopBar
        leftActions={<AdminBackButton />}
        rightActions={
          <>
            <ResponsiveIconButton
              as={Link}
              href={ROUTES_REPOSITORIES.admin.update({
                id: params?.id?.toString() ?? 'unknown',
              })}
              isDisabled={!params?.id}
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
              confirmVariant="@dangerSecondary"
            >
              <IconButton
                aria-label={t('common:actions.delete')}
                icon={<LuTrash2 />}
                isDisabled={!repository.data}
                isLoading={repositoryRemove.isLoading}
              />
            </ConfirmModal>
          </>
        }
      >
        {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
        {repository.isSuccess && (
          <Heading size="sm">{repository.data?.name}</Heading>
        )}
      </AdminLayoutPageTopBar>
      <AdminLayoutPageContent>
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
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
