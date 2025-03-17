import { entries } from 'remeda';
import { getHeaders as vinxiGetHeaders } from 'vinxi/http';

export const getHeaders = () => {
  const headers = new Headers();
  entries(vinxiGetHeaders()).forEach(([key, value]) => {
    if (value) {
      headers.append(key, value);
    }
  });
  return headers;
};
