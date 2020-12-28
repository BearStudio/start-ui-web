export const reactDayPicker = {
  '.DayPickerInput': {
    display: 'inline-block',
    fontSize: '0.1rem',
    width: '100%',
  },

  '.DayPickerInput-OverlayWrapper': {
    position: { base: 'absolute', sm: 'relative' },
    left: { base: 0, sm: 'auto' },
    right: { base: 0, sm: 'auto' },
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '3em',
    width: { base: '22rem', sm: '100%' },
  },

  '.DayPickerInput-Overlay': {
    position: 'absolute',
    left: '0px',
    zIndex: 2,
    borderRadius: '3%',

    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
  },

  '.DayPicker-Caption > div': {
    fontWeight: '400',
    fontSize: '1em',
  },

  '.DayPicker-Weekday': {
    fontWeight: '350',
    color: 'black',
    fontSize: '0.875em',
  },

  '.DayPicker': {
    display: 'inline-block',
    fontSize: '1rem',
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: '2%',
    width: '22em',
  },

  '.DayPicker-Day--disabled': {
    pointerEvents: 'none',
  },

  '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)': {
    position: 'relative',

    backgroundColor: 'brandSecondary.600',
    borderRadius: '100%',
  },

  '.DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside):hover': {
    backgroundColor: 'brandSecondary.600',
    borderRadius: '100%',
    color: 'white',
  },

  '.DayPicker:not(.DayPicker--interactionDisabled)': {
    '.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover': {
      backgroundColor: 'brandSecondary.100',
      borderRadius: '100%',
      color: 'black',
    },
  },

  '.DayPicker-Day--today': {
    color: 'black',
    fontWeight: 'bold',
  },

  '.DayPicker-Day': {
    display: 'table-cell',
    padding: '0.5em',
    borderRadius: '50%',
    verticaAlign: 'middle',
    textAlign: 'center',
    cursor: 'pointer',
    height: '2.8rem',
    width: '2.8rem',
  },
};
