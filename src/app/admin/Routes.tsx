import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { PageUserManagement } from '@/app/admin/PageUserManagement';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/user-management" element={<PageUserManagement />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
