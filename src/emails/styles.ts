import { CSSProperties } from 'react';

import { theme } from '@/emails/theme';

export const styles = {
  main: {
    backgroundColor: theme.colors.white,
    fontFamily: theme.fontFamily.sans,
  },
  container: {
    padding: '16px 12px',
    margin: '0 auto',
  },
  section: {
    margin: '16px 0',
  },
  h1: {
    color: theme.colors.text,
    fontFamily: theme.fontFamily.sans,
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '8px 0',
    padding: '0',
  },
  link: {
    color: theme.colors.brand,
    fontFamily: theme.fontFamily.sans,
    textDecoration: 'underline',
  },
  button: {
    fontSize: '14px',
    backgroundColor: theme.colors.brand,
    color: theme.colors.white,
    lineHeight: 1.5,
    borderRadius: '0.5em',
    padding: '0.75em 1.5em',
  },
  text: {
    color: theme.colors.text,
    fontFamily: theme.fontFamily.sans,
    fontSize: '16px',
    margin: '8px 0',
    lineHeight: '1.5',
  },
  textMuted: {
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.sans,
    fontSize: '14px',
    margin: '8px 0',
    lineHeight: '1.5',
  },
  code: {
    display: 'inline-block',
    padding: '12px 16px',
    wordBreak: 'break-all',
    letterSpacing: '2px',
    margin: '8px 0',
    fontSize: '32px',
    fontFamily: theme.fontFamily.code,
    backgroundColor: '#f4f4f4',
    borderRadius: '5px',
    border: '1px solid #eee',
    color: theme.colors.text,
  },
  footer: {
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.sans,
    fontSize: '12px',
    lineHeight: '22px',
  },
} satisfies Record<string, CSSProperties>;
