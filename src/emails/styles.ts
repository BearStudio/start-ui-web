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
  text: {
    color: theme.colors.text,
    fontFamily: theme.fontFamily.sans,
    fontSize: '14px',
    margin: '8px 0',
  },
  code: {
    display: 'inline-block',
    padding: '12px 16px',
    width: '100%',
    wordBreak: 'break-all',
    fontSize: '12px',
    backgroundColor: '#f4f4f4',
    borderRadius: '5px',
    border: '1px solid #eee',
    color: theme.colors.text,
  },
  footer: {
    color: '#898989',
    fontFamily: theme.fontFamily.sans,
    fontSize: '12px',
    lineHeight: '22px',
  },
} satisfies Record<string, CSSProperties>;
