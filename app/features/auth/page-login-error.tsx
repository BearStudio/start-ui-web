import { Link } from '@tanstack/react-router';
import { AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function PageLoginError({
  search,
}: {
  search: { error?: string };
}) {
  if (search.error === 'signup_disabled') {
    return (
      <Wrapper>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>Account not found</AlertTitle>
          <AlertDescription>You need an account to login</AlertDescription>
        </Alert>
      </Wrapper>
    );
  }
  if (search.error === 'access_denied') {
    return (
      <Wrapper>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Not able to login, please try again
          </AlertDescription>
        </Alert>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>Failed to login, please try again</AlertDescription>
      </Alert>
    </Wrapper>
  );
}

const Wrapper = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {children}
      <Button asChild variant="link">
        <Link to="/login">
          <ArrowLeftIcon />
          Back to login
        </Link>
      </Button>
    </div>
  );
};
