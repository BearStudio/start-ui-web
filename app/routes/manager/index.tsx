import { createFileRoute, Link } from '@tanstack/react-router';

import { WithPermission } from '@/lib/auth/with-permission';

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <h1>MANAGER</h1>
      <WithPermission
        permission={{ apps: ['app'] }}
        fallback={<span>No App access</span>}
      >
        <Link to="/app">Go to App</Link>
      </WithPermission>
      <Link to="/">Go to Home (public)</Link>
    </div>
  );
}
