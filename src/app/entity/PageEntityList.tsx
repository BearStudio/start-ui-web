import React from 'react';
import { Box } from '@chakra-ui/core';
import { Link } from 'react-router-dom';

export const PageEntityList = () => {
  return (
    <Box>
      PageEntityList Component
      <br />
      <Link to="./create">Create Entity</Link>
    </Box>
  );
};
