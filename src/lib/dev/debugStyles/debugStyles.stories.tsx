import { Box, Stack } from '@chakra-ui/react';

import { debugStyles } from '@/lib/dev/debugStyles';

export default {
  title: 'Utils/debugStyles',
};

export const Default = {
  render: () => <Box h="32" {...debugStyles()} />,
};

export const WithCustomLabelAndColor = () => (
  <Box
    h="32"
    {...debugStyles({
      label: 'MyComponent',
      colorScheme: 'brand',
      hideBackground: false,
    })}
  />
);

export const WithoutLabel = () => (
  <Box
    h="32"
    {...debugStyles({
      hideLabel: true,
    })}
  />
);

export const RealCaseUsage = () => (
  <Box
    p={4}
    {...debugStyles({
      colorScheme: 'red',
      label: 'Container',
    })}
  >
    <Stack
      {...debugStyles({
        colorScheme: 'cyan',
        label: 'List',
        hideBackground: false,
      })}
    >
      <Box
        h="8"
        {...debugStyles({
          label: 'ListItem 1',
          hideBackground: false,
        })}
      />
      <Box
        h="8"
        w="90%"
        {...debugStyles({
          label: 'ListItem 2',
          hideBackground: false,
        })}
      />
      <Box
        h="8"
        w="50%"
        {...debugStyles({
          label: 'ListItem 3',
          hideBackground: false,
        })}
      />
      <Box
        h="8"
        w="60%"
        {...debugStyles({
          label: 'ListItem 4',
          hideBackground: false,
        })}
      />
    </Stack>
  </Box>
);
