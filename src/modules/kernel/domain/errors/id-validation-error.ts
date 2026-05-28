import { DomainError } from './domain-error';

const MAX_VISIBLE_ID_LENGTH = 48;

const formatInvalidIdValue = (value: unknown) => {
  if (typeof value !== 'string') return String(value);

  const trimmed = value.trim();
  if (!trimmed) return '<blank>';
  if (trimmed.length <= MAX_VISIBLE_ID_LENGTH) return trimmed;

  return `${trimmed.slice(0, 24)}...<truncated:${trimmed.length}>`;
};

export class IdValidationError extends DomainError {
  constructor(typeName: string, value: unknown, message?: string) {
    super('INVALID_ID', {
      message: message ?? `${typeName} is invalid`,
      details: {
        typeName,
        value: formatInvalidIdValue(value),
      },
    });
    this.name = 'IdValidationError';
  }
}
