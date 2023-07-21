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
import { useTranslation } from 'react-i18next';
import { LuEdit3, LuExternalLink, LuTrash2 } from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ConfirmModal } from '@/components/ConfirmModal';
import { ErrorPage } from '@/components/ErrorPage';
import { Icon } from '@/components/Icons';
import { Page, PageContent, PageTopBar } from '@/components/Page';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  useRepository,
  useRepositoryRemove,
} from '@/features/repositories/service';
import { Loader } from '@/layout/Loader';

export default function PageRepository() {
  const { t } = useTranslation(['common', 'repositories']);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const params = useParams();
  const navigate = useNavigate();
  const repository = useRepository(Number(params?.id));
  const repositoryRemove = useRepositoryRemove({
    onSuccess: (_, { name }) => {
      toastSuccess({
        title: t('repositories:feedbacks.deleteRepositorySuccess.title'),
        description: t(
          'repositories:feedbacks.deleteRepositorySuccess.description',
          {
            name,
          }
        ),
      });
      navigate('/repositories');
    },
    onError: (_, { name }) => {
      toastError({
        title: t('repositories:feedbacks.deleteRepositoryError.title'),
        description: t(
          'repositories:feedbacks.deleteRepositoryError.description',
          {
            name,
          }
        ),
      });
    },
  });

  return (
    <Page containerSize="lg">
      <PageTopBar zIndex={0} showBack onBack={() => navigate('/repositories')}>
        <HStack>
          <Box flex={1}>
            {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
            {repository.isSuccess && (
              <Heading size="md">{repository.data?.name}</Heading>
            )}
          </Box>
          <ButtonGroup>
            <ResponsiveIconButton as={Link} to="update" icon={<LuEdit3 />}>
              {t('common:actions.edit')}
            </ResponsiveIconButton>

            <ConfirmModal
              title={t('repositories:deleteModal.title')}
              message={t('repositories:deleteModal.message', {
                name: repository.data?.name,
              })}
              onConfirm={() =>
                repository.data && repositoryRemove.mutate(repository.data)
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
        {repository.isLoading && <Loader />}
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
