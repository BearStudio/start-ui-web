import { mode } from '@chakra-ui/theme-tools';
import 'react-day-picker/lib/style.css';

export const reactDayPicker = (props) => ({
  '.DayPicker *': {
    outline: 'none',
  },

  '.DayPickerInput': {
    display: 'inline-block',
    fontSize: '0.1em',
    width: '100%',
  },

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
    bg: mode('white', 'gray.700')(props),
  },

  '.DayPicker': {
    display: 'inline-block',
    fontSize: { base: '0.8rem', sm: '1rem' },
    borderRadius: 'md',
    width: 'min-content',
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
      backgroundColor: mode('brand.500', 'brand.600')(props),
      borderRadius: '100%',
    },

  '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside):hover':
    {
      backgroundColor: mode('brand.400', 'brand.500')(props),
      borderRadius: '100%',
      color: 'white',
    },

  '.DayPicker:not(.DayPicker--interactionDisabled)': {
    '.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover':
      {
        backgroundColor: mode('blackAlpha.200', 'whiteAlpha.200')(props),
        borderRadius: '100%',
        color: mode('black', 'white')(props),
      },
  },

  '.DayPicker-Day--weekend:.DayPicker-Day--selected': {
    color: 'white',
  },

  '.DayPicker-Day--weekend': {
    color: 'gray.400',
  },

  '.DayPicker-Day': {
    display: 'block',
    borderRadius: 'full',
    cursor: 'pointer',
    height: '2rem',
    minWidth: '2rem',
    transition: '0.2s',
    padding: 0,
    lineHeight: '2rem',
  },

  '.DayPicker-Day--today': {
    color: mode('black', 'white')(props),
    fontWeight: 'bold',
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
    color: mode('black', 'white')(props),
    fontSize: '0.875em',
  },

  '.DayPicker-Body': {
    display: 'grid',
  },

  '.DayPicker-Week': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridGap: '0.1rem',
  },
});
