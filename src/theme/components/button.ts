export default {
  variants: {
    // Custom variants
    '@primary': () => ({
      color: 'white',
      bg: 'brand.500',
      _hover: {
        bg: 'brand.600',
      },
    }),
    '@secondary': () => ({
      color: 'brand.600',
      bg: 'brand.50',
      _hover: {
        bg: 'brand.100',
        color: 'brand.700',
      },
    }),
    '@danger': () => ({
      color: 'error.600',
      bg: 'error.50',
      _hover: {
        bg: 'error.100',
        color: 'error.700',
      },
    }),

    // Default variants
    solid: ({ colorScheme }) => ({
      bg: colorScheme === 'gray' ? `${colorScheme}.100` : `${colorScheme}.600`,
      _hover: {
        bg:
          colorScheme === 'gray' ? `${colorScheme}.200` : `${colorScheme}.700`,
      },
    }),
    ghost: ({ colorScheme }) => ({
      bg: `${colorScheme}.50`,
      _hover: {
        bg: `${colorScheme}.100`,
      },
    }),
  },
};
