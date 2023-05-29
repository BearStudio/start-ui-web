import { StyleFunctionProps, Styles } from '@chakra-ui/theme-tools';

import * as externals from './externals';

const externalsStyles = (props: StyleFunctionProps) =>
  Object.values(externals).reduce(
    (acc, cur) => ({
      ...acc,
      ...(typeof cur === 'function' ? cur(props) : cur),
    }),
    {}
  );

export const styles: Styles = {
  global: (props) => ({
    html: {
      bg: 'gray.800',
    },
    body: {
      // Prevent visual jump between pages with and without scroll
      overflowY: 'scroll',
      WebkitTapHighlightColor: 'transparent',
      bg: 'gray.50',
      _dark: {
        bg: 'gray.800',
      },
    },
    '#chakra-toast-portal > *': {
      pt: 'safe-top',
      pl: 'safe-left',
      pr: 'safe-right',
      pb: 'safe-bottom',
    },
    ...externalsStyles(props),
  }),
};
