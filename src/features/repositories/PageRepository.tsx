import React from 'react';

import {
  Box,
  Card,
  CardBody,
  Heading,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuExternalLink } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorPage } from '@/components/ErrorPage';
import { Icon } from '@/components/Icons';
import { Page, PageContent, PageTopBar } from '@/components/Page';
import { useRepository } from '@/features/repositories/service';
import { Loader } from '@/layout/Loader';

export default function PageRepository() {
  const { t } = useTranslation(['common', 'repositories']);

  const params = useParams();
  const navigate = useNavigate();
  const repository = useRepository(Number(params?.id));

  return (
    <Page containerSize="lg">
      <PageTopBar zIndex={0} showBack onBack={() => navigate('/repositories')}>
        {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}

        {repository.isSuccess && (
          <Heading size="md">{repository.data?.name}</Heading>
        )}
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
                <Box as="a" href={repository.data?.link} target="_blank">
                  <Text fontSize="sm" fontWeight="bold">
                    {t('repositories:data.link.label')}
                    <Icon marginLeft={1} icon={LuExternalLink} />
                  </Text>

                  <Text _hover={{ textDecoration: 'underline' }}>
                    {repository.data?.link}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold">
                    {t('repositories:data.description.label')}
                  </Text>
                  <Text>{repository.data?.description}</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        )}
      </PageContent>
    </Page>
  );
}
