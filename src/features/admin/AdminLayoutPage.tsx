import React, { useContext, useMemo } from 'react';

import {
  Box,
  Flex,
  FlexProps,
  HStack,
  IconButton,
  Stack,
} from '@chakra-ui/react';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import useMeasure from 'react-use-measure';

import {
  AdminLayoutContextNavDisplayed,
  useAdminLayoutContext,
} from '@/features/admin/AdminLayout';
import { useAdminLayoutHideNav } from '@/features/admin/AdminLayout';
import { ADMIN_NAV_BAR_HEIGHT } from '@/features/admin/AdminNavBar';
import { useRtl } from '@/hooks/useRtl';

type AdminLayoutPageContextValue = {
  nav: React.ReactNode;
  hideContainer: boolean;
  containerSize: keyof typeof containerSizes;
};

const AdminLayoutPageContext =
  React.createContext<AdminLayoutPageContextValue | null>(null);

const useAdminLayoutPageContext = () => {
  const context = useContext(AdminLayoutPageContext);
  if (context === null) {
    throw new Error('Missing parent <AdminLayoutPage> component');
  }
  return context;
};

const containerSizes = {
  sm: '60ch',
  md: '80ch',
  lg: '100ch',
  xl: '140ch',
  full: '100%',
} as const;

const PageContainer = ({ children, ...rest }: FlexProps) => {
  const { hideContainer, containerSize } = useAdminLayoutPageContext();

  if (hideContainer) return <>{children}</>;

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

type AdminLayoutPageTopBarProps = FlexProps & {
  onBack?(): void;
  showBack?: boolean;
  isFixed?: boolean;
};

export const AdminLayoutPageTopBar = ({
  children,
  onBack = () => undefined,
  showBack = false,
  isFixed = true,
  ...rest
}: AdminLayoutPageTopBarProps) => {
  const { navDisplayed } = useAdminLayoutContext();
  const [ref, { height }] = useMeasure();

  const { rtlValue } = useRtl();

  return (
    <>
      {isFixed && <Box h={`${height}px`} />}
      <Flex
        zIndex={2}
        direction="column"
        py={3}
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
        bg="white"
        ref={ref}
        _dark={{
          bg: 'gray.800',
          borderTop: '1px solid',
          borderTopColor: 'blackAlpha.600',
        }}
        {...(isFixed
          ? {
              top: navDisplayed
                ? navDisplayed === 'desktop'
                  ? { base: 0, md: ADMIN_NAV_BAR_HEIGHT }
                  : ADMIN_NAV_BAR_HEIGHT
                : '0',
              position: 'fixed',
              right: '0',
              left: '0',
            }
          : {})}
        {...rest}
      >
        <Box w="full" h="0" pb="safe-top" />
        <PageContainer>
          <HStack spacing="4">
            {showBack && (
              <Box>
                <IconButton
                  aria-label="Go Back"
                  icon={rtlValue(<LuArrowLeft />, <LuArrowRight />)}
                  onClick={() => onBack()}
                />
              </Box>
            )}
            <Box flex="1">{children}</Box>
          </HStack>
        </PageContainer>
      </Flex>
    </>
  );
};

type AdminLayoutPageContentProps = FlexProps & {
  onBack?(): void;
  showBack?: boolean;
};

export const AdminLayoutPageContent = ({
  children,
  ...rest
}: AdminLayoutPageContentProps) => {
  const { nav } = useAdminLayoutPageContext();
  return (
    <Flex
      position="relative"
      zIndex="1"
      direction="column"
      flex="1"
      py="4"
      {...rest}
    >
      <PageContainer>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          spacing={{ base: '4', lg: '8' }}
          flex="1"
        >
          {nav && (
            <Flex direction="column" minW="0" w={{ base: 'full', lg: '12rem' }}>
              {nav}
            </Flex>
          )}
          <Flex direction="column" flex="1" minW="0">
            {children}
          </Flex>
        </Stack>
      </PageContainer>
      <Box w="full" h="0" pb="safe-bottom" />
    </Flex>
  );
};

export const AdminLayoutPageBottomBar = ({ children, ...rest }: FlexProps) => {
  const [ref, { height }] = useMeasure();

  return (
    <>
      <Box h={`${height}px`} />
      <Flex
        zIndex="3"
        ref={ref}
        direction="column"
        mt="auto"
        position="fixed"
        bottom="0"
        insetStart="0"
        insetEnd="0"
        py="2"
        boxShadow="0 -4px 20px rgba(0, 0, 0, 0.05)"
        bg="white"
        _dark={{ bg: 'gray.800' }}
        {...rest}
      >
        <PageContainer>{children}</PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </>
  );
};

type AdminLayoutPageProps = FlexProps & {
  showNavBar?: AdminLayoutContextNavDisplayed;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideContainer?: boolean;
  nav?: React.ReactNode;
};

export const AdminLayoutPage = ({
  showNavBar = true,
  hideContainer = false,
  containerSize = 'md',
  nav = null,
  ...rest
}: AdminLayoutPageProps) => {
  useAdminLayoutHideNav(showNavBar);

  const value = useMemo(
    () => ({
      nav,
      hideContainer,
      containerSize,
    }),
    [containerSize, hideContainer, nav]
  );

  return (
    <AdminLayoutPageContext.Provider value={value}>
      <Flex direction="column" flex="1" position="relative" {...rest} />
    </AdminLayoutPageContext.Provider>
  );
};
