import { extendTheme } from '@chakra-ui/react';

import Badge from './components/badge';
import Input from './components/input';
import Select from './components/select';
import Textarea from './components/textarea';
import { colors } from './foundations/colors';
import { layout } from './foundations/layout';
import { shadows } from './foundations/shadows';
import { spacing } from './foundations/spacing';
import { styles } from './foundations/styles';

export default extendTheme({
  styles,
  colors,
  layout,
  shadows,
  space: spacing,
  components: { Badge, Input, Select, Textarea },
});
