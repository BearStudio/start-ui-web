import { Temporal } from 'temporal-polyfill';
import {
  diffDays,
  diffHours,
  diffMinutes,
  diffMonths,
  diffSeconds,
  diffYears,
  endOfYear,
  startOfYear,
} from 'temporal-utils';
import './polyfill';

const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';
const DATE_INPUT_SPACERS = [' ', '.', '/', '-', '_'];
const TOKEN_PATTERN = /(\[[^\]]*\]|YYYY|YY|DD|D|MM|M|HH|H|mm|m|ss|s)/g;
const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

type DateParts = {
  day: number;
  month: number;
  year: number;
};

type TemporalDateTimeParts = DateParts & {
  hour: number;
  minute: number;
  second: number;
};

type DateToken = keyof DateParts | 'yearTwoDigit';

type CompiledDateFormat = {
  regex: RegExp;
  tokens: Array<DateToken>;
};

type ParseStringToDateOptions = {
  includeDefaultFormats?: boolean;
};

type RelativeDateUnit = Intl.RelativeTimeFormatUnit;

const compiledDateFormatsCache = new Map<string, CompiledDateFormat>();

const escapeRegExp = (value: string) =>
  value.replace(REGEX_SPECIAL_CHARS, '\\$&');

const pad = (value: number, length = 2) =>
  value.toString().padStart(length, '0');

const getCurrentTimeZoneId = () => Temporal.Now.timeZoneId();

const createInvalidDate = () => new Date(Number.NaN);

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

const getCurrentPlainDate = () =>
  Temporal.Now.plainDateISO(getCurrentTimeZoneId());

const plainDateFromDate = (date: Date) =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime())
    .toZonedDateTimeISO(getCurrentTimeZoneId())
    .toPlainDate();

const plainDateTimeFromDate = (date: Date) =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime())
    .toZonedDateTimeISO(getCurrentTimeZoneId())
    .toPlainDateTime();

const instantFromDate = (date: Date) =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime());

const dateFromPlainDate = (date: Temporal.PlainDate) =>
  new Date(date.toZonedDateTime(getCurrentTimeZoneId()).epochMilliseconds);

const resolveTwoDigitYear = (year: number) =>
  year <= 68 ? 2000 + year : 1900 + year;

const compileDateFormat = (format: string): CompiledDateFormat => {
  const cached = compiledDateFormatsCache.get(format);
  if (cached) return cached;

  const tokens: Array<DateToken> = [];
  let pattern = '^';
  let cursor = 0;

  for (const match of format.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    const index = match.index ?? 0;

    pattern += escapeRegExp(format.slice(cursor, index));

    if (token.startsWith('[') && token.endsWith(']')) {
      pattern += escapeRegExp(token.slice(1, -1));
    } else if (token === 'D') {
      tokens.push('day');
      pattern += String.raw`(\d{1,2})`;
    } else if (token === 'DD') {
      tokens.push('day');
      pattern += String.raw`(\d{2})`;
    } else if (token === 'M') {
      tokens.push('month');
      pattern += String.raw`(\d{1,2})`;
    } else if (token === 'MM') {
      tokens.push('month');
      pattern += String.raw`(\d{2})`;
    } else if (token === 'YY') {
      tokens.push('yearTwoDigit');
      pattern += String.raw`(\d{2})`;
    } else if (token === 'YYYY') {
      tokens.push('year');
      pattern += String.raw`(\d{4})`;
    } else {
      pattern += escapeRegExp(token);
    }

    cursor = index + token.length;
  }

  pattern += escapeRegExp(format.slice(cursor));
  pattern += '$';

  const compiled = { regex: new RegExp(pattern), tokens };
  compiledDateFormatsCache.set(format, compiled);
  return compiled;
};

const buildDefaultDateInputFormats = () => {
  const dayMonthFormats = DATE_INPUT_SPACERS.flatMap((spacer) => [
    `D${spacer}M`,
    `DD${spacer}M`,
    `D${spacer}MM`,
    `DD${spacer}MM`,
  ]);
  const dayMonthYearFormats = DATE_INPUT_SPACERS.flatMap((spacer) =>
    ['YY', 'YYYY'].flatMap((yearFormat) => [
      `D${spacer}M${spacer}${yearFormat}`,
      `DD${spacer}M${spacer}${yearFormat}`,
      `D${spacer}MM${spacer}${yearFormat}`,
      `DD${spacer}MM${spacer}${yearFormat}`,
    ])
  );

  return [
    'D',
    'DD',
    'DDMM',
    'DDMMYY',
    'DDMMYYYY',
    ...dayMonthFormats,
    ...dayMonthYearFormats,
  ];
};

const DEFAULT_DATE_INPUT_FORMATS = buildDefaultDateInputFormats();

const parseDateParts = (
  input: string,
  format: string,
  currentDate = getCurrentPlainDate()
) => {
  const compiled = compileDateFormat(format);
  const match = compiled.regex.exec(input.trim());

  if (!match) return null;

  const parts: Partial<DateParts> = {};

  compiled.tokens.forEach((token, index) => {
    const value = Number(match[index + 1]);

    if (token === 'yearTwoDigit') {
      parts.year = resolveTwoDigitYear(value);
      return;
    }

    parts[token] = value;
  });

  return {
    day: parts.day ?? currentDate.day,
    month: parts.month ?? currentDate.month,
    year: parts.year ?? currentDate.year,
  };
};

const plainDateFromParts = (parts: DateParts) => {
  try {
    return Temporal.PlainDate.from(parts, { overflow: 'reject' });
  } catch {
    return null;
  }
};

const formatParts = (parts: TemporalDateTimeParts, format: string) =>
  format.replace(TOKEN_PATTERN, (token) => {
    if (token.startsWith('[') && token.endsWith(']')) {
      return token.slice(1, -1);
    }

    switch (token) {
      case 'YYYY':
        return pad(parts.year, 4);
      case 'YY':
        return pad(parts.year % 100);
      case 'DD':
        return pad(parts.day);
      case 'D':
        return parts.day.toString();
      case 'MM':
        return pad(parts.month);
      case 'M':
        return parts.month.toString();
      case 'HH':
        return pad(parts.hour);
      case 'H':
        return parts.hour.toString();
      case 'mm':
        return pad(parts.minute);
      case 'm':
        return parts.minute.toString();
      case 'ss':
        return pad(parts.second);
      case 's':
        return parts.second.toString();
      default:
        return token;
    }
  });

const getRelativeDateUnit = (
  base: Temporal.Instant,
  target: Temporal.Instant
): { value: number; unit: RelativeDateUnit } => {
  const seconds = diffSeconds(base, target, 'halfExpand');
  if (Math.abs(seconds) < 60) return { value: seconds, unit: 'second' };

  const minutes = diffMinutes(base, target, 'halfExpand');
  if (Math.abs(minutes) < 60) return { value: minutes, unit: 'minute' };

  const hours = diffHours(base, target, 'halfExpand');
  if (Math.abs(hours) < 24) return { value: hours, unit: 'hour' };

  const timeZone = getCurrentTimeZoneId();
  const baseDateTime = base.toZonedDateTimeISO(timeZone);
  const targetDateTime = target.toZonedDateTimeISO(timeZone);

  const days = diffDays(baseDateTime, targetDateTime, 'halfExpand');
  if (Math.abs(days) < 30) return { value: days, unit: 'day' };

  const months = diffMonths(baseDateTime, targetDateTime, 'halfExpand');
  if (Math.abs(months) < 12) return { value: months, unit: 'month' };

  return {
    value: diffYears(baseDateTime, targetDateTime, 'halfExpand'),
    unit: 'year',
  };
};

export const parseStringToDate = (
  input: string,
  extraFormats: Array<string> = [],
  options: ParseStringToDateOptions = {}
) => {
  const currentDate = getCurrentPlainDate();
  const formats =
    options.includeDefaultFormats === false
      ? extraFormats
      : [...extraFormats, ...DEFAULT_DATE_INPUT_FORMATS];

  for (const format of formats) {
    const parts = parseDateParts(input, format, currentDate);
    if (!parts) continue;

    const date = plainDateFromParts(parts);
    if (date) return dateFromPlainDate(date);
  }

  return createInvalidDate();
};

export const parseDateByFormat = (
  input: string,
  format = DEFAULT_DATE_FORMAT
) => {
  const parts = parseDateParts(input, format);
  const date = parts ? plainDateFromParts(parts) : null;

  return date ? dateFromPlainDate(date) : createInvalidDate();
};

export const formatDate = (
  date: Date | null | undefined,
  format = DEFAULT_DATE_FORMAT
) => {
  if (!date || !isValidDate(date)) return '';

  const dateTime = plainDateTimeFromDate(date);

  return formatParts(
    {
      day: dateTime.day,
      hour: dateTime.hour,
      minute: dateTime.minute,
      month: dateTime.month,
      second: dateTime.second,
      year: dateTime.year,
    },
    format
  );
};

export const formatCurrentDate = (format = DEFAULT_DATE_FORMAT) => {
  const now = Temporal.Now.zonedDateTimeISO(getCurrentTimeZoneId());

  return formatParts(
    {
      day: now.day,
      hour: now.hour,
      minute: now.minute,
      month: now.month,
      second: now.second,
      year: now.year,
    },
    format
  );
};

export const formatCurrentLocalIsoDateTime = () =>
  Temporal.Now.zonedDateTimeISO(getCurrentTimeZoneId()).toString({
    smallestUnit: 'second',
    timeZoneName: 'never',
  });

export const formatRelativeDate = (
  date: Date,
  options: {
    baseDate?: Date;
    locale?: string;
  } = {}
) => {
  if (!isValidDate(date)) return '';

  const target = instantFromDate(date);
  const base =
    options.baseDate && isValidDate(options.baseDate)
      ? instantFromDate(options.baseDate)
      : Temporal.Now.instant();
  const { value, unit } = getRelativeDateUnit(base, target);

  return new Intl.RelativeTimeFormat(options.locale, {
    numeric: 'auto',
  }).format(value, unit);
};

export const isSameDate = (
  left: Date | null | undefined,
  right: Date | null | undefined
) => {
  if (!left || !right || !isValidDate(left) || !isValidDate(right)) {
    return false;
  }

  return (
    Temporal.PlainDate.compare(
      plainDateFromDate(left),
      plainDateFromDate(right)
    ) === 0
  );
};

export const startOfTodayYearDate = () =>
  dateFromPlainDate(startOfYear(getCurrentPlainDate()));

export const endOfTodayYearDate = () =>
  dateFromPlainDate(endOfYear(getCurrentPlainDate()));

export const addMonthsToDate = (date: Date, months: number) => {
  if (!isValidDate(date)) return createInvalidDate();

  return dateFromPlainDate(plainDateFromDate(date).add({ months }));
};

export const addDaysToDate = (date: Date, days: number) => {
  if (!isValidDate(date)) return createInvalidDate();

  return dateFromPlainDate(plainDateFromDate(date).add({ days }));
};

export const withDayOfMonth = (date: Date, day: number) => {
  if (!isValidDate(date)) return createInvalidDate();

  return dateFromPlainDate(
    plainDateFromDate(date).with({ day }, { overflow: 'constrain' })
  );
};
