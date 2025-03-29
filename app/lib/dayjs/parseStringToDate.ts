import dayjs from 'dayjs';

export const parseStringToDate = (
  input: string,
  extraFormats: Array<string> = []
) => {
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
    true
  ).toDate();
};
