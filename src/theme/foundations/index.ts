import { colors } from './colors';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';
import { zIndices } from './z-index';

const foundations = {
  colors,
  ...typography,
  shadows,
  space: spacing,
  zIndices,
};

export default foundations;
