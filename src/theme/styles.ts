import { StyleFunctionProps, Styles } from '@chakra-ui/theme-tools';

import * as externals from './externals';

const externalsStyles = (props: StyleFunctionProps) =>
  Object.values(externals).reduce(
    (acc: object, cur) => ({
      ...acc,
      ...(typeof cur === 'function' ? cur(props) : cur),
    }),
    {}
  );

export const styles: Styles = {
  global: (props) => ({
    html: {
      bg: 'gray.900',
    },
    body: {
      WebkitTapHighlightColor: 'transparent',
      bg: 'white',
      _dark: {
        bg: 'gray.900',
      },
    },
    '#chakra-toast-portal > *': {
      pt: 'safe-top',
      pl: 'safe-left',
      pr: 'safe-right',
      pb: 'safe-bottom',
    },
    form: {
      display: 'flex',
      flexDir: 'column',
      flex: 1,
    },
    ...externalsStyles(props),
  }),
};
