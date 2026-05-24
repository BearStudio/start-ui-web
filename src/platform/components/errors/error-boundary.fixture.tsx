import { ErrorBoundary } from '@/platform/components/errors/error-boundary';
const Boom = () => {
  throw new Error(
    "Uncaught TypeError: Cannot read property 'read' of undefined at <anonymous>: 1:5"
  );
};

const Default = () => {
  return (
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  );
};

const InSmallArea = () => {
  return (
    <div className="size-20">
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    </div>
  );
};

export default {
  Default,
  InSmallArea,
};
