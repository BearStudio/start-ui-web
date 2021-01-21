import { extendTheme } from '@chakra-ui/react';

import Badge from './components/badge';
import Input from './components/input';
import { colors } from './foundations/colors';
import { shadows } from './foundations/shadows';
import { spacing } from './foundations/spacing';
import { styles } from './foundations/styles';

export default extendTheme({
  styles,
  colors,
  shadows,
  space: spacing,
  components: { Badge, Input },
});
