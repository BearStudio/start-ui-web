import { Styles } from '@chakra-ui/theme-tools';

export const reactDayPicker: Styles['global'] = {
  '.DayPickerInput-OverlayWrapper': {
    position: { base: 'absolute', sm: 'relative' },
    left: { base: 0, sm: 'auto' },
    right: { base: 0, sm: 'auto' },
    marginLeft: 'auto',
    marginRight: 'auto',
    top: '3em',
    width: '100%',
    maxWidth: '90vw',
  },

  '.DayPickerInput-Overlay': {
    position: 'absolute',
    left: '0',
    zIndex: 2,
    borderRadius: 'md',
    boxShadow: 'lg',
    bg: 'white',
    _dark: {
      bg: 'gray.700',
    },
  },

  '.DayPicker': {
    display: 'inline-block',
    fontSize: { base: '0.8rem', sm: '1rem' },
    borderRadius: 'md',
    width: 'min-content',

    color: 'gray.900',
    _dark: {
      color: 'white',
    },

    '*': {
      outline: 'none',
    },

    '.DayPickerInput': {
      display: 'inline-block',
      fontSize: '0.1em',
      width: '100%',
    },

    '.DayPicker-Months': {
      display: 'grid',
      gridTemplateColumns: {
        base: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        xl: 'repeat(4, 1fr)',
      },
    },

    '.DayPicker-Day--outside': {
      backgroundColor: 'transparent!important',
    },

    '.DayPicker-Day--disabled, .DayPicker-Day--today.DayPicker-Day--disabled': {
      pointerEvents: 'none',
    },

    '.DayPicker-Day--today.DayPicker-Day--disabled': {
      color: 'gray.300',
    },

    '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)':
      {
        position: 'relative',
        backgroundColor: 'brand.500',
        borderRadius: '100%',
        _dark: {
          backgroundColor: 'brand.600',
        },
      },

    '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside):hover':
      {
        backgroundColor: 'brand.400',
        borderRadius: '100%',
        color: 'white',
        _dark: {
          backgroundColor: 'brand.500',
        },
      },

    '&:not(.DayPicker--interactionDisabled)': {
      '.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover':
        {
          backgroundColor: 'blackAlpha.200',
          borderRadius: '100%',
          color: 'black',
          _dark: {
            backgroundColor: 'whiteAlpha.200',
            color: 'white',
          },
        },
    },

    '.DayPicker-Day--weekend:.DayPicker-Day--selected': {
      color: 'white',
    },

    '.DayPicker-Day--weekend': {
      color: 'gray.400',
    },

    '.DayPicker-Day': {
      height: '2.2rem',
      width: '2.2rem',
      padding: '0',
      aspectRatio: 1,
      lineHeight: '2.2rem',
    },

    '.DayPicker-Day--today': {
      color: 'black',
      fontWeight: 'bold',
      _dark: {
        color: 'white',
      },
    },

    '.DayPicker-Caption': {
      display: 'block',
    },

    '.DayPicker-Caption > div': {
      fontWeight: '400',
      fontSize: '1em',
    },

    '.DayPicker-Weekdays': {
      display: 'block',
    },

    '.DayPicker-WeekdaysRow': {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
    },

    '.DayPicker-Weekday': {
      display: 'block',
      fontWeight: '350',
      color: 'black',
      fontSize: '0.875em',
      _dark: {
        color: 'white',
      },
    },

    '.DayPicker-Body': {
      display: 'grid',
    },

    '.DayPicker-Week': {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gridGap: '0.1rem',
    },
  },
};
