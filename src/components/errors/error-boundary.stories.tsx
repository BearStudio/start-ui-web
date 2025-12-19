import { Meta } from '@storybook/react-vite';

import { ErrorBoundary } from '@/components/errors/error-boundary';

export default {
  title: 'Errors/Error Boundary',
} satisfies Meta<typeof ErrorBoundary>;

const Boom = () => {
  throw new Error(
    "Uncaught TypeError: Cannot read property 'read' of undefined at <anonymous>: 1:5"
  );
};

export const Default = () => {
  return (
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  );
};

export const InSmallArea = () => {
  return (
    <div className="size-20">
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    </div>
  );
};
