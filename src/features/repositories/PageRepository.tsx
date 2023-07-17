import React from 'react';

import {
  Box,
  HStack,
  Heading,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LuExternalLink } from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Icon } from '@/components/Icons';
import { Page, PageContent, PageTopBar } from '@/components/Page';
import { useRepository } from '@/features/repositories/service';

export default function PageRepository() {
  const { t } = useTranslation(['common', 'repositories']);

  const params = useParams();
  const navigate = useNavigate();
  const repository = useRepository(Number(params?.id));

  return (
    <Page containerSize="lg">
      <PageTopBar
        _dark={{ bg: 'gray.700' }}
        zIndex={0}
        showBack
        onBack={() => navigate('/repositories')}
      >
        {repository.isLoading || repository.isError ? (
          <HStack spacing="4">
            <Box flex="1">
              <SkeletonText maxW="6rem" noOfLines={2} />
            </Box>
          </HStack>
        ) : (
          <HStack spacing="4">
            <Heading size="md">{repository.data?.name}</Heading>
          </HStack>
        )}
      </PageTopBar>
      <PageContent>
        {repository.isLoading || repository.isError ? (
          <SkeletonText maxW="6rem" noOfLines={2} />
        ) : (
          <Stack
            direction="column"
            borderRadius="lg"
            spacing="6"
            shadow="md"
            bg="white"
            _dark={{ bg: 'gray.700' }}
            p="6"
          >
            <Box>
              <Text
                fontSize={14}
                fontWeight={700}
                color="gray.600"
                _dark={{ color: 'gray.300' }}
              >
                {t('repositories:data.name.label')}
              </Text>
              <Text size="md">{repository.data?.name}</Text>
            </Box>
            <Box>
              <Text
                fontSize={14}
                fontWeight={700}
                color="gray.600"
                _dark={{ color: 'gray.300' }}
              >
                {t('repositories:data.link.label')}
                <Icon marginLeft={1} icon={LuExternalLink} />
              </Text>
              <Link to={repository.data?.link}>
                <Text _hover={{ textDecoration: 'underline' }}>
                  {repository.data?.link}
                </Text>
              </Link>
            </Box>
            <Box>
              <Text
                fontSize={14}
                fontWeight={700}
                color="gray.600"
                _dark={{ color: 'gray.300' }}
              >
                {t('repositories:data.description.label')}
              </Text>
              <Text size="md">{repository.data?.description}</Text>
            </Box>
          </Stack>
        )}
      </PageContent>
    </Page>
  );
}
