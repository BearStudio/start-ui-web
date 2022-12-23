import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import type {
  PartsStyleFunction,
  PartsStyleObject,
  SystemStyleFunction,
  SystemStyleObject,
} from '@chakra-ui/theme-tools';
import { mode } from '@chakra-ui/theme-tools';

const baseStyleOverlay: SystemStyleObject = {
  backdropFilter: 'blur(4px)',
};

const baseStyleDialog: SystemStyleFunction = (props) => {
  return {
    bg: mode('white', 'gray.800')(props),
    mx: 4,
    py: 0,
  };
};

const baseStyleHeader: SystemStyleObject = {
  px: 4,
  pt: 4,
  pb: 0,
};

const baseStyleCloseButton: SystemStyleObject = {
  top: 2,
  insetEnd: 2,
};

const baseStyleBody: SystemStyleFunction = (_) => {
  return {
    px: 4,
    py: 4,
  };
};

const baseStyleFooter: SystemStyleObject = {
  px: 4,
  pt: 0,
  pb: 4,
};

const baseStyle: PartsStyleFunction<typeof parts> = (props) => ({
  overlay: baseStyleOverlay,
  dialog: baseStyleDialog(props),
  header: baseStyleHeader,
  closeButton: baseStyleCloseButton,
  body: baseStyleBody(props),
  footer: baseStyleFooter,
});

/**
 * Since the `maxWidth` prop references theme.sizes internally,
 * we can leverage that to size our modals.
 */
function getSize(value: string): PartsStyleObject<typeof parts> {
  if (value === 'full') {
    return {
      dialog: {
        maxW: '100vw',
        minH: '100vh',
        '@supports(min-height: -webkit-fill-available)': {
          minH: '-webkit-fill-available',
        },
        '@supports(min-height: fill-available)': {
          minH: 'fill-available',
        },
        m: 0,
        borderRadius: 0,
      },
    };
  }
  return {
    dialog: { maxW: value },
  };
}

const sizes = {
  xs: getSize('xs'),
  sm: getSize('sm'),
  md: getSize('md'),
  lg: getSize('lg'),
  xl: getSize('xl'),
  '2xl': getSize('2xl'),
  '3xl': getSize('3xl'),
  '4xl': getSize('4xl'),
  '5xl': getSize('5xl'),
  '6xl': getSize('6xl'),
  full: getSize('full'),
};

const defaultProps = {
  size: 'md',
};

export default {
  parts: parts.keys,
  baseStyle,
  sizes,
  defaultProps,
};
