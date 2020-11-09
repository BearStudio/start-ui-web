import React, { useState } from 'react';
import { useUserList } from '@/app/admin/service';
import { Page, PageBody, PageHeader } from '@/components';

export const PageUserManagement = () => {
  const [page, setPage] = useState(0);

  const { users, totalItems, hasMore } = useUserList({ page });

  return (
    <Page>
      <PageHeader>User Management</PageHeader>
      <PageBody>
        <pre>{totalItems}</pre>
        <div>
          {users?.map((user) => (
            <pre key={user.id}>{JSON.stringify(user, null, 2)}</pre>
          ))}
        </div>
        <span>Current Page: {page + 1}</span>
        <div>
          <button onClick={() => setPage((old) => old - 1)} disabled={page < 1}>
            Previous Page
          </button>{' '}
          <button onClick={() => setPage((old) => old + 1)} disabled={!hasMore}>
            Next Page
          </button>
        </div>
      </PageBody>
    </Page>
  );
};
