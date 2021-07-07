import { mode } from '@chakra-ui/theme-tools';

import * as externals from './externals';

const externalsStyles = Object.values(externals).reduce(
  (acc, cur) => ({ ...acc, ...cur }),
  {}
);

export const styles = {
  global: (props) => ({
    html: {
      bg: 'gray.800',
    },
    body: {
      bg: mode('gray.50', 'gray.800')(props),
      WebkitTapHighlightColor: 'transparent',
    },
    '#chakra-toast-portal > *': {
      pt: 'safe-top',
      pl: 'safe-left',
      pr: 'safe-right',
      pb: 'safe-bottom',
    },
    ...externalsStyles,
  }),
};
