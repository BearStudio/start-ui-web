'use client';

import {
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Wrap,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

export const DevToolsDrawer = ({
  disclosure,
}: {
  disclosure: ReturnType<typeof useDisclosure>;
}) => {
  const { colorMode, setColorMode } = useColorMode();

  const { t, i18n } = useTranslation(['common']);

  return (
    <Drawer
      onClose={disclosure.onClose}
      isOpen={disclosure.isOpen}
      size="xs"
      placement="left"
    >
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Development panel</DrawerHeader>
        <DrawerBody>
          <Stack spacing={6}>
            <Checkbox
              isChecked={colorMode === 'dark'}
              onChange={(e) =>
                setColorMode(e.target.checked ? 'dark' : 'light')
              }
            >
              Dark mode
            </Checkbox>
            <FormControl>
              <FormLabel>Language</FormLabel>
              <RadioGroup
                value={i18n.language}
                onChange={(newValue) => i18n.changeLanguage(newValue)}
              >
                <Wrap spacing={4}>
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <Radio key={language.key} value={language.key}>
                      {t(`common:languages.${language.key}`)}
                    </Radio>
                  ))}
                </Wrap>
              </RadioGroup>
            </FormControl>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
