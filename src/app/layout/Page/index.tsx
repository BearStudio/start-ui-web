import React, { useContext, useLayoutEffect, useRef, useState } from 'react';

import { Box, Flex, FlexProps, HStack, IconButton } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';

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

interface PageHeaderProps extends FlexProps {
  onBack?(): void;
  showBack?: boolean;
}

export const PageHeader = ({
  children,
  onBack = () => {},
  showBack = false,
  ...rest
}: PageHeaderProps) => {
  const { isFocusMode } = useContext(PageContext);
  return (
    <Flex
      z="2"
      direction="column"
      pt="4"
      pb={isFocusMode ? 4 : undefined}
      boxShadow={isFocusMode ? '0 4px 20px rgba(0, 0, 0, 0.05)' : undefined}
      bg={isFocusMode ? 'white' : undefined}
      {...rest}
    >
      {isFocusMode && <Box w="full" h="0" pb="safe-top" />}
      <PageContainer>
        <HStack spacing="4">
          {showBack && (
            <Box ml={{ base: 0, lg: '-3.5rem' }}>
              <IconButton
                aria-label="Go Back"
                icon={<FiArrowLeft fontSize="lg" />}
                variant="ghost"
                onClick={() => onBack()}
              />
            </Box>
          )}
          <Box flex="1">{children}</Box>
        </HStack>
      </PageContainer>
    </Flex>
  );
};

export const PageBody = ({ children, ...rest }: FlexProps) => {
  return (
    <Flex z="1" direction="column" flex="1" py="4" {...rest}>
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
        z="3"
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
