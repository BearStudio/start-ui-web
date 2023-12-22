import dayjs, { ConfigType, Dayjs } from 'dayjs';

export const parseInputToDate = (
  input: ConfigType,
  extraFormats: Array<string> = []
): Dayjs => {
  return dayjs(
    input,
    [
      ...extraFormats,
      'DD',
      'DDMM',
      'DD/MM',
      'DD-MM',
      'DD.MM',
      'DD MM',
      'DDMMYY',
      'DD/MM/YY',
      'DD-MM-YY',
      'DD.MM.YY',
      'DD MM YY',
      'DDMMYYYY',
      'DD/MM/YYYY',
      'DD-MM-YYYY',
      'DD.MM.YYYY',
      'DD MM YYYY',
    ],
    'fr',
    true
  );
};
