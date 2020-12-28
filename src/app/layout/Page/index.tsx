import React, { useContext, useLayoutEffect, useRef, useState } from 'react';

import { Box, Flex, FlexProps } from '@chakra-ui/react';

import { useFocusMode } from '@/app/layout';

interface PageProps extends FlexProps {
  isFocusMode?: boolean;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideContainer?: boolean;
}

const PageContext = React.createContext(null);

const PageContainer = ({ children, ...rest }) => {
  const { hideContainer, containerSize } = useContext(PageContext);

  const containerSizes = {
    sm: '60ch',
    md: '80ch',
    lg: '100ch',
    xl: '140ch',
    full: '100%',
  };

  if (hideContainer) return children;

  return (
    <Flex
      direction="column"
      flex="1"
      w="full"
      px="6"
      mx="auto"
      maxW={containerSizes[containerSize]}
      {...rest}
    >
      {children}
    </Flex>
  );
};

export const PageHeader = ({ children, ...rest }: FlexProps) => {
  const { isFocusMode } = useContext(PageContext);
  return (
    <Flex
      direction="column"
      pt="4"
      pb={isFocusMode ? 4 : undefined}
      boxShadow={isFocusMode ? '0 4px 20px rgba(0, 0, 0, 0.05)' : undefined}
      bg={isFocusMode ? 'white' : undefined}
      {...rest}
    >
      {isFocusMode && <Box w="full" h="0" pb="safe-top" />}
      <PageContainer>{children}</PageContainer>
    </Flex>
  );
};

export const PageBody = ({ children, ...rest }: FlexProps) => {
  return (
    <Flex direction="column" flex="1" py="4" {...rest}>
      <PageContainer>{children}</PageContainer>
      <Box w="full" h="0" pb="safe-bottom" />
    </Flex>
  );
};

export const PageFooter = ({ children, ...rest }: FlexProps) => {
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
        direction="column"
        mt="auto"
        position="fixed"
        bg="white"
        bottom="0"
        left="0"
        right="0"
        py="2"
        boxShadow="0 -4px 20px rgba(0, 0, 0, 0.05)"
        {...rest}
      >
        <PageContainer>{children}</PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </>
  );
};

export const Page = ({
  isFocusMode = false,
  hideContainer,
  containerSize = 'md',
  ...rest
}: PageProps) => {
  useFocusMode(isFocusMode);
  return (
    <PageContext.Provider
      value={{
        isFocusMode,
        hideContainer,
        containerSize,
      }}
    >
      <Flex direction="column" flex="1" position="relative" {...rest} />
    </PageContext.Provider>
  );
};
