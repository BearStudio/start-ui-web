import { useId } from 'react';

import {
  FormControl,
  FormLabel,
  HStack,
  Switch,
  useColorMode,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export const DarkModeSwitch = () => {
  const { t } = useTranslation(['account']);
  const { colorMode, setColorMode } = useColorMode();
  const id = useId();

  return (
    <FormControl display="flex" alignItems="center">
      <HStack>
        <FormLabel
          as={colorMode === 'light' ? 'span' : undefined}
          opacity={colorMode !== 'light' ? 0.5 : undefined}
          htmlFor={id}
          mb="0"
          mr={0}
        >
          {t('account:preferences.theme.light')}
        </FormLabel>
        <Switch
          colorScheme="brand"
          id={id}
          isChecked={colorMode === 'dark'}
          onChange={(e) => setColorMode(e.target.checked ? 'dark' : 'light')}
        />
        <FormLabel
          as={colorMode === 'dark' ? 'span' : undefined}
          opacity={colorMode !== 'dark' ? 0.5 : undefined}
          htmlFor={id}
          mb="0"
        >
          {t('account:preferences.theme.dark')}
        </FormLabel>
      </HStack>
    </FormControl>
  );
};
