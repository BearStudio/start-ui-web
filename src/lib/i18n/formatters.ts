import dayjs from 'dayjs';

const MINUTES_IN_AN_HOUR = 60;

/**
 *   Default Date formatter uses dayjs.
 *
 *   To see supported dayjs date format : https://day.js.org/docs/en/display/format
 */
export const formatDate = (date: Date, format?: string) => {
  return dayjs(date).format(format);
};

/* Custom formatter Example */
export const minutesToHours = (minutes: string | number) => {
  return typeof minutes === 'string'
    ? Number(minutes) / MINUTES_IN_AN_HOUR
    : minutes / MINUTES_IN_AN_HOUR;
};
