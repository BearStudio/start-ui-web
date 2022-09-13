import { ErrorBoundary } from './index';

export default {
  title: 'Errors/ErrorBoundary',
};

const Boom = () => {
  throw new Error('Boom!');
};

export const Default = () => {
  return (
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  );
};
