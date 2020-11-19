import { extendTheme } from '@chakra-ui/react';
import { colors } from './colors';
import { Badge } from './components/Badge';
import { Input } from './components/Input';

export default extendTheme({
  styles: {
    global: {
      html: {
        bg: 'gray.800',
      },
      body: {
        bg: 'gray.50',
      },
    },
  },
  colors,
  components: { Badge, Input },
});
