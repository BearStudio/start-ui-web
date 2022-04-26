import React from 'react';

import { Button, Center, Heading, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Error403 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Center flex="1" p="8">
      <Stack align="center" textAlign="center">
        <Heading>{t('errors:403.title')}</Heading>
        <Text color="gray.600" _dark={{ color: 'gray.400' }}>
          {t('errors:403.description')}
        </Text>
        <Button onClick={() => navigate(-1)}>
          {t('errors:403.actions.goBack')}
        </Button>
      </Stack>
    </Center>
  );
};
