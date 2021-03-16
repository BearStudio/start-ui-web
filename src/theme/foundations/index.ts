import { colors } from './colors';
import { layout } from './layout';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

const foundations = {
  colors,
  ...typography,
  shadows,
  space: spacing,
  layout,
};

export default foundations;
