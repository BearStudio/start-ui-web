import React from 'react';
import { Routes } from 'react-router-dom';
import { Error404 } from '@/errors';
import { Route } from '@/app/router';
import { PageEntityList } from '@/app/entity/PageEntityList';
import { PageEntityCreate } from '@/app/entity/PageEntityCreate';

export const EntityRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PageEntityList />} />
      <Route path="/create" element={<PageEntityCreate />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
