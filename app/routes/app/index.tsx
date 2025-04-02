import { createFileRoute, Link } from '@tanstack/react-router';

import { WithPermission } from '@/lib/auth/with-permission';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1>APP</h1>
      <WithPermission
        permission={{ apps: ['manager'] }}
        fallback={<span>No Manager access</span>}
      >
        <Link to="/manager">Go to Manager</Link>
      </WithPermission>
      <Link to="/">Go to Home (public)</Link>
    </div>
  );
}
