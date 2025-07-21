import dayjs from 'dayjs';

const spacers = [' ', '.', '/', '-', '_'];
const DD_MM = (year?: 'YY' | 'YYYY') => {
  return spacers.flatMap((spacer) => {
    const yearFormat = year ? `${spacer}${year}` : '';
    return [
      `D${spacer}M${yearFormat}`,
      `DD${spacer}M${yearFormat}`,
      `D${spacer}MM${yearFormat}`,
      `DD${spacer}MM${yearFormat}`,
    ];
  });
};

export const parseStringToDate = (
  input: string,
  extraFormats: Array<string> = []
) => {
  return dayjs(
    input,
    [
      ...extraFormats,
      'D',
      'DD',
      'DDMM',
      'DDMMYY',
      'DDMMYYYY',
      ...DD_MM(),
      ...DD_MM('YY'),
      ...DD_MM('YYYY'),
    ],
    true
  ).toDate();
};
