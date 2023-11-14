import { DayModifiers, ModifiersStyles } from 'react-day-picker';

import { colors } from '@/theme/foundations/colors';

export const DEFAULT_MODIFIERS: DayModifiers = {
  weekend: { dayOfWeek: [0, 6] },
};

export const DEFAULT_MODIFIERS_STYLES: ModifiersStyles = {
  today: { fontWeight: 'bold' },
  selected: { backgroundColor: colors.brand[500] },
  weekend: { color: 'gray' },
};

export const DATE_FORMAT = 'DD/MM/YYYY';
