import { ChakraProps, ThemeTypings } from '@chakra-ui/react';

export const debugComponent = ({
  label = 'Debug',
  colorScheme = 'green',
  hideLabel = false,
  hideBackground = true,
}: {
  label?: string;
  colorScheme?: ThemeTypings['colorSchemes'];
  hideLabel?: boolean;
  hideBackground?: boolean;
} = {}): ChakraProps => {
  if (process.env.NODE_ENV !== 'development') return {};
  return {
    border: '1px solid',
    borderColor: `${colorScheme}.500`,
    backgroundColor: !hideBackground ? `${colorScheme}.50` : undefined,
    position: 'relative',
    _after: hideLabel
      ? undefined
      : {
          zIndex: 1,
          content: `"${label}"`,
          position: 'absolute',
          left: 0,
          bottom: 0,
          fontSize: 'xs',
          px: 2,
          py: 0.5,
          color: `${colorScheme}.600`,
          backgroundColor: `${colorScheme}.100`,
          borderRadius: '0 5px 0 0',
          boxShadow: '0 0 4px rgba(0, 0, 0, .2)',
        },
  };
};
