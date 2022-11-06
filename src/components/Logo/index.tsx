import React from 'react';

import { Box, chakra, useTheme } from '@chakra-ui/react';

export const Logo = ({ ...rest }) => {
  const theme = useTheme();
  const gradientId = 'logo-brand-gradient';
  return <Box sx={{ color: 'white', fontFamily: '' }}>🫠</Box>;
};
