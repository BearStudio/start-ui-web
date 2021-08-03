import React from 'react';

import { Button, Stack, Center, Heading, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useDarkMode } from '@/hooks/useDarkMode';

export const Error403 = () => {
  const { colorModeValue } = useDarkMode();
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <Center flex="1" p="8">
      <Stack align="center" textAlign="center">
        <Heading>{t('errors:403.title')}</Heading>
        <Text color={colorModeValue('gray.600', 'gray.400')}>
          {t('errors:403.description')}
        </Text>
        <Button onClick={() => history.goBack()}>
          {t('errors:403.actions.goBack')}
        </Button>
      </Stack>
    </Center>
  );
};
