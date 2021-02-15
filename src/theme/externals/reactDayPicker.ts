import 'react-day-picker/lib/style.css';

export const reactDayPicker = {
  '.DayPickerInput': {
    display: 'inline-block',
    fontSize: '0.1em',
    width: '100%',
  },

  '.DayPickerInput-OverlayWrapper': {
    position: 'static',
    width: '100%',
    maxWidth: '50vw',
  },

  '.DayPickerInput-Overlay': {
    marginTop: '3em',
    position: 'absolute',
    left: '0',
    zIndex: 2,
    borderRadius: 'md',
    boxShadow: 'lg',
  },

  '.DayPicker': {
    display: 'inline-block',
    fontSize: { base: '0.8rem', sm: '1rem' },
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: 'md',
    maxWidth: 'fit-content',
  },

  '.DayPicker-Months': {
    display: 'grid',
    gridTemplateColumns: { base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
  },

  '.DayPicker-Day--outside': {
    backgroundColor: 'transparent!important',
  },

  '.DayPicker-Day--disabled, .DayPicker-Day--today.DayPicker-Day--disabled': {
    pointerEvents: 'none',
  },

  '.DayPicker-Day--today.DayPicker-Day--disabled': {
    color: 'gray.400',
  },

  '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)': {
    position: 'relative',
    backgroundColor: 'brand.500',
    borderRadius: '100%',
  },

  '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside):hover': {
    backgroundColor: 'brand.500',
    borderRadius: '100%',
    color: 'white',
  },

  '.DayPicker:not(.DayPicker--interactionDisabled)': {
    '.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover': {
      backgroundColor: 'brand.100',
      borderRadius: '100%',
    },

    '.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):not(.DayPicker-Day--today):hover': {
      color: 'black',
    },

    '.DayPicker-Day--today:not(.DayPicker-Day--selected)': {
      color: 'brand.500',
    },

    '.DayPicker-Day--today.DayPicker-Day--disabled': {
      color: 'brand.100',
    },
  },

  '.DayPicker-Day': {
    display: 'block',
    borderRadius: 'full',
    cursor: 'pointer',
    height: '2.8em',
    minWidth: '2.8em',
    transition: '0.2s',
    padding: 0,
    lineHeight: '2.8em',
  },

  '.DayPicker-Day--today': {
    color: 'brand.500',
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
    color: 'black',
    fontSize: '0.875em',
  },

  '.DayPicker-Body': {
    display: 'grid',
  },

  '.DayPicker-Week': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
  },

  '.DayPickerRange .DayPicker-Day--selected:not(.DayPicker-Day--disabled), .DayPickerRange .DayPicker-Day--selected:not(.DayPicker-Day--disabled):hover': {
    borderRadius: '0',
  },

  '.DayPickerRange .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--disabled)': {
    bgColor: 'brand.100',
  },

  '.DayPickerRange .DayPicker-Day--selected.DayPicker-Day--start:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)': {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  '.DayPickerRange .DayPicker-Day--selected.DayPicker-Day--end:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)': {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  '.DayPickerRange .DayPicker-Day--selected.DayPicker-Day--start, .DayPickerRange .DayPicker-Day--selected.DayPicker-Day--end': {
    backgroundColor: 'brand.500',
  },

  '.DayPickerRange .DayPicker-Day--start.DayPicker-Day--end:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)': {
    borderRadius: '100%',
  },
};
