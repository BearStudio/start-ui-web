import { ReactNode } from '@tanstack/react-router';
import { match } from 'ts-pattern';

export const PageError = (props: { errorCode?: number }) => {
  return match(props.errorCode)
    .with(403, () => <PageErrorContent title="Unauthorized" />)
    .with(404, () => <PageErrorContent title="Page not found" />)
    .otherwise(() => <PageErrorContent title="Something went wrong" />);
};

const PageErrorContent = (props: { title: ReactNode }) => {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-xl font-bold">{props.title}</h1>
    </div>
  );
};
