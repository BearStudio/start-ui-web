import { mode } from '@chakra-ui/theme-tools';
import 'react-day-picker/lib/style.css';

export const reactDayPicker = (props) => ({
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
    marginTop: '3em',
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
    border: '1px solid',
    borderColor: mode('gray.200', 'gray.900')(props),
    borderRadius: 'md',
    maxWidth: '90vw',
  },

  '.DayPicker-Day--disabled': {
    pointerEvents: 'none',
  },

  '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)': {
    position: 'relative',
    backgroundColor: mode('brand.500', 'brand.600')(props),
    borderRadius: '100%',
  },

  '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside):hover': {
    backgroundColor: mode('brand.400', 'brand.500')(props),
    borderRadius: '100%',
    color: 'white',
  },

  '.DayPicker:not(.DayPicker--interactionDisabled)': {
    '.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover': {
      backgroundColor: mode('blackAlpha.200', 'whiteAlpha.200')(props),
      borderRadius: '100%',
      color: mode('black', 'white')(props),
    },
  },

  '.DayPicker-Day': {
    borderRadius: 'full',
    cursor: 'pointer',
    height: '2.8em',
    width: '2.8em',
    transition: '0.2s',
  },

  '.DayPicker-Day--today': {
    color: mode('black', 'white')(props),
    fontWeight: 'bold',
  },

  '.DayPicker-Caption > div': {
    fontWeight: '400',
    fontSize: '1em',
  },

  '.DayPicker-Weekday': {
    fontWeight: '350',
    color: mode('black', 'white')(props),
    fontSize: '0.875em',
  },
});
