import { extendTheme } from '@chakra-ui/react';

import Badge from './components/_badge';
import Input from './components/_input';
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
