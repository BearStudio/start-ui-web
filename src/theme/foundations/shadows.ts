import { transparentize } from '@chakra-ui/theme-tools';

import { colors } from './colors';

const createOutline = (colorScheme = 'gray') =>
  // eslint-disable-next-line sonarjs/no-nested-template-literals
  `0 0 0 3px ${transparentize(`${colorScheme}.500`, 0.3)({ colors })}`;

export const shadows = {
  outline: createOutline('brand'),
  'outline-brand': createOutline('brand'),
  'outline-gray': createOutline('gray'),
  'outline-success': createOutline('success'),
  'outline-warning': createOutline('warning'),
  'outline-error': createOutline('error'),
};
