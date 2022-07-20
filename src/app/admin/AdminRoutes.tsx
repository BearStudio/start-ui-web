import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import { PageApiDocumentation } from '@/app/admin/api/PageApiDocumentation';
import { ErrorPage } from '@/components/ErrorPage';

const AdminUsersRoutes = React.lazy(
  () => import('@/app/admin/users/AdminUsersRoutes')
);

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="users" replace />} />
      <Route path="users/*" element={<AdminUsersRoutes />} />
      <Route path="api/*" element={<PageApiDocumentation />} />
      <Route path="*" element={<ErrorPage errorCode={404} />} />
    </Routes>
  );
};

export default AdminRoutes;
