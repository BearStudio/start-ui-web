import { extendTheme } from '@chakra-ui/react';

import * as components from './components';
import { config } from './config';
import foundations from './foundations';
import { styles } from './styles';

export const theme = extendTheme({
  config,
  styles,
  ...foundations,
  components: { ...components },
});
