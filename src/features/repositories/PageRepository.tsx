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
import { useToastError } from '@/components/Toast';
import {
  useRepository,
  useRepositoryRemove,
} from '@/features/repositories/service';
import { Loader } from '@/layout/Loader';

export default function PageRepository() {
  const { t } = useTranslation(['common', 'repositories']);

  const toastError = useToastError();

  const params = useParams();
  const navigate = useNavigate();
  const repository = useRepository(Number(params?.id));
  const repositoryRemove = useRepositoryRemove({
    onSuccess: () => {
      navigate('/repositories');
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
      <PageTopBar zIndex={0} showBack onBack={() => navigate('/repositories')}>
        <HStack>
          <Box flex={1}>
            {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
            {repository.isSuccess && (
              <Heading size="md">{repository.data?.body.name}</Heading>
            )}
          </Box>
          <ButtonGroup>
            <ResponsiveIconButton as={Link} to="update" icon={<LuEdit3 />}>
              {t('common:actions.edit')}
            </ResponsiveIconButton>

            <ConfirmModal
              title={t('repositories:deleteModal.title')}
              message={t('repositories:deleteModal.message', {
                name: repository.data?.body.name,
              })}
              onConfirm={() =>
                repository.data &&
                repositoryRemove.mutate({
                  params: { id: repository.data.body.id.toString() },
                  body: undefined,
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
                  <Text>{repository.data?.body.name}</Text>
                </Box>
                <Box
                  role="group"
                  as="a"
                  href={repository.data?.body.link}
                  target="_blank"
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {t('repositories:data.link.label')}
                    <Icon marginLeft={1} icon={LuExternalLink} />
                  </Text>

                  <Text _groupHover={{ textDecoration: 'underline' }}>
                    {repository.data?.body.link}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {t('repositories:data.description.label')}
                  </Text>
                  <Text>
                    {repository.data?.body.description || <small>-</small>}
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
