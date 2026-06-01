import { isEmpty, mapValues, pickBy, pipe } from 'remeda';

type TelemetryTagValue = string | number | boolean;

const isTelemetryTagValue = (value: unknown): value is TelemetryTagValue =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

export const toTelemetryStringTags = (
  tags: Record<string, unknown>,
  options: { allowEmpty?: boolean } = {}
): Record<string, string> | undefined => {
  const stringTags = pipe(
    tags,
    pickBy(
      (value): value is TelemetryTagValue =>
        isTelemetryTagValue(value) &&
        (options.allowEmpty === true || String(value).length > 0)
    ),
    mapValues((value) => String(value))
  );

  return isEmpty(stringTags) ? undefined : stringTags;
};
