import { popoverAnatomy as parts } from '@chakra-ui/anatomy';
import type {
  PartsStyleFunction,
  SystemStyleFunction,
  SystemStyleObject,
} from '@chakra-ui/theme-tools';
import { cssVar, mode } from '@chakra-ui/theme-tools';

const $popperBg = cssVar('popper-bg');

const baseStyleContent: SystemStyleFunction = (props) => {
  const bg = mode('white', 'gray.900')(props);
  return {
    [$popperBg.variable]: `colors.${bg}`,
    py: 3,
    maxW: '98vw',
  };
};

const baseStyleHeader: SystemStyleObject = {
  px: 3,
  pt: 0,
  pb: 0,
  borderBottomWidth: 0,
  fontWeight: 'semibold',
};

const baseStyleBody: SystemStyleObject = {
  px: 3,
  py: 0,
};

const baseStyleFooter: SystemStyleObject = {
  px: 3,
  pb: 0,
  pt: 3,
  borderTopWidth: 0,
};

const baseStyleCloseButton: SystemStyleObject = {
  top: 1,
  insetEnd: 1,
  padding: 2,
};

const baseStyle: PartsStyleFunction<typeof parts> = (props) => ({
  content: baseStyleContent(props),
  header: baseStyleHeader,
  body: baseStyleBody,
  footer: baseStyleFooter,
  closeButton: baseStyleCloseButton,
});

export default {
  parts: parts.keys,
  baseStyle,
  defaultProps: {
    size: 'xs',
  },
  sizes: {
    '3xs': {
      content: {
        width: '3xs',
      },
    },
    '2xs': {
      content: {
        width: '2xs',
      },
    },
    xs: {
      content: {
        width: 'xs',
      },
    },
    sm: {
      content: {
        width: 'sm',
      },
    },
    md: {
      content: {
        width: 'md',
      },
    },
    lg: {
      content: {
        width: 'lg',
      },
    },
    xl: {
      content: {
        width: 'xl',
      },
    },
    '2xl': {
      content: {
        width: '2xl',
      },
    },
    '3xl': {
      content: {
        width: '3xl',
      },
    },
    '4xl': {
      content: {
        width: '4xl',
      },
    },
    '5xl': {
      content: {
        width: '5xl',
      },
    },
    '6xl': {
      content: {
        width: '6xl',
      },
    },
    '7xl': {
      content: {
        width: '7xl',
      },
    },
    '8xl': {
      content: {
        width: '8xl',
      },
    },
  },
};
