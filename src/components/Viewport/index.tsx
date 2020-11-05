import React from 'react';
import { Flex } from '@chakra-ui/core';

const updateCssViewportHeight = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

if (typeof window !== 'undefined') {
  updateCssViewportHeight();
  window.addEventListener('resize', () => {
    updateCssViewportHeight();
  });
}

export const Viewport = (props) => {
  return (
    <Flex
      direction="column"
      minH="100vh"
      maxW="100vw"
      style={{
        minHeight: 'calc(var(--vh, 1vh) * 100)',
      }}
      {...props}
    />
  );
};
