import { Dayjs } from 'dayjs';
import { DateInterval } from 'react-day-picker';

/** fonction utilitaire pour désactiver les dates du DayPicker qui sont antérieures à une date de référence
 * @param referenceDate date de référence
 */
export const getBeforeDateDisabledDatesConfig = (
  referenceDate: Dayjs
): Pick<DateInterval, 'before'> | null => {
  if (!referenceDate) {
    return null;
  }
  return { before: referenceDate?.toDate() };
};

/** fonction utilitaire pour désactiver les dates du DayPicker qui sont postérieurs à une date de référence
 * @param referenceDate date de référence
 */
export const getAfterDateDisabledDatesConfig = (
  referenceDate: Dayjs
): Pick<DateInterval, 'after'> | null => {
  if (!referenceDate) {
    return null;
  }
  return { after: referenceDate?.toDate() };
};
