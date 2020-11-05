import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Wrap, WrapItem, Link } from '@chakra-ui/core';

export const Navbar = () => {
  return (
    <Wrap>
      <WrapItem>
        <Link as={RouterLink} to="/dashboard">
          Dashboard
        </Link>
      </WrapItem>
      <WrapItem>
        <Link as={RouterLink} to="/entity">
          Entity
        </Link>
      </WrapItem>
      <WrapItem>
        <Link as={RouterLink} to="/logout">
          Go to Logout
        </Link>
      </WrapItem>
    </Wrap>
  );
};
