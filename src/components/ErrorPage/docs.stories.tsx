import { ErrorPage } from './index';

export default {
  title: 'Errors/ErrorPage',
};

export const Default = () => {
  return <ErrorPage />;
};

export const Error404 = () => {
  return <ErrorPage errorCode={404} />;
};

export const Error403 = () => {
  return <ErrorPage errorCode={403} />;
};

export const Error500 = () => {
  return <ErrorPage errorCode={500} />;
};
