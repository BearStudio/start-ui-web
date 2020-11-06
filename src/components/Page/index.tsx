import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { Box, BoxProps, Flex } from '@chakra-ui/core';

interface PageProps extends BoxProps {
  container?: false | BoxProps;
}

const PageContext = React.createContext(null);

const PageContainer = ({ children, ...rest }) => {
  const { containerProps } = useContext(PageContext);

  if (containerProps === false) return children;

  return (
    <Flex
      direction="column"
      w="full"
      px="6"
      mx="auto"
      maxW="65ch"
      {...containerProps}
      {...rest}
    >
      {children}
    </Flex>
  );
};

export const Page = ({ container, ...rest }: PageProps) => {
  return (
    <PageContext.Provider value={{ containerProps: container }}>
      <Flex direction="column" flex="1" position="relative" {...rest} />
    </PageContext.Provider>
  );
};

export const PageHeader = ({ children, ...rest }) => {
  return (
    <Flex direction="column" py="4" {...rest}>
      <PageContainer>{children}</PageContainer>
    </Flex>
  );
};

export const PageBody = ({ children, ...rest }) => {
  return (
    <Flex direction="column" flex="1" {...rest}>
      <PageContainer>{children}</PageContainer>
    </Flex>
  );
};

export const PageFooter = ({ children, ...rest }) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(footerRef.current?.offsetHeight || 0);
  }, [setHeight]);

  return (
    <>
      <Box h={`${height}px`} />
      <Flex
        ref={footerRef}
        mt="auto"
        position="fixed"
        bg="white"
        bottom="0"
        left="0"
        right="0"
        boxShadow="0 -4px 10px rgba(0, 0, 0, 0.05)"
        {...rest}
      >
        <PageContainer>{children}</PageContainer>
      </Flex>
    </>
  );
};
