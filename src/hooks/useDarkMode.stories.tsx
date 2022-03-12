import { Button, Code, HStack, Stack, Text } from '@chakra-ui/react';
import { FiMoon, FiSun } from 'react-icons/fi';

import { Icon } from '@/components';

import { useDarkMode } from './useDarkMode';

export default {
  title: 'Hooks/useDarkMode',
};

export const Default = () => {
  const { colorMode, colorModeValue, toggleColorMode, setColorMode } =
    useDarkMode();

  return (
    <Stack>
      <Text>
        Use the <Code>colorModeValue(lighValue, darkValue)</Code> function to
        set props based on the current <Code>colorMode</Code> (current:{' '}
        {colorMode})
      </Text>
      <Text>
        The following code component will change its background color based on
        the current color mode.
      </Text>
      <Code
        bg={colorModeValue('blue.100', 'green.700')}
        children="colorModeValue('blue.100', 'green.700')"
      />

      <HStack>
        <Button
          leftIcon={<Icon icon={colorMode === 'light' ? FiSun : FiMoon} />}
          onClick={toggleColorMode}
        >
          Toggle
        </Button>
        <Button
          leftIcon={<Icon icon={FiSun} />}
          onClick={() => setColorMode('light')}
        >
          Light
        </Button>
        <Button
          leftIcon={<Icon icon={FiMoon} />}
          onClick={() => setColorMode('dark')}
        >
          Dark
        </Button>
      </HStack>
    </Stack>
  );
};
