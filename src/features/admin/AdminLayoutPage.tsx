import React, { useContext, useMemo } from 'react';

import {
  Box,
  Container,
  ContainerProps,
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
  useAdminLayoutHideNav,
} from '@/features/admin/AdminLayout';
import { ADMIN_NAV_BAR_HEIGHT } from '@/features/admin/AdminNavBar';
import { useRtl } from '@/hooks/useRtl';

type AdminLayoutPageContextValue = {
  nav: React.ReactNode;
  noContainer: boolean;
  containerMaxWidth: ContainerProps['maxW'];
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

const PageContainer = ({ children, maxW, ...rest }: ContainerProps) => {
  const { noContainer, containerMaxWidth } = useAdminLayoutPageContext();

  if (noContainer) return <>{children}</>;
  return (
    <Container
      display="flex"
      flexDirection="column"
      flex="1"
      w="full"
      maxW={maxW ?? containerMaxWidth}
      {...rest}
    >
      {children}
    </Container>
  );
};

type AdminLayoutPageTopBarProps = FlexProps & {
  onBack?(): void;
  showBack?: boolean;
  isFixed?: boolean;
  containerMaxWidth?: ContainerProps['maxW'];
};

export const AdminLayoutPageTopBar = ({
  children,
  onBack = () => undefined,
  showBack = false,
  isFixed = true,
  containerMaxWidth,
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
        boxShadow="layout"
        bg="white"
        ref={ref}
        borderBottom="1px solid transparent"
        borderBottomColor="gray.100"
        _dark={{
          bg: 'gray.900',
          color: 'white',
          borderBottomColor: 'gray.800',
          boxShadow: 'layout-dark',
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
        <PageContainer maxW={containerMaxWidth}>
          <HStack spacing="4">
            {showBack && (
              <Box>
                <IconButton
                  size="sm"
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
  containerMaxWidth?: ContainerProps['maxW'];
};

export const AdminLayoutPageContent = ({
  children,
  containerMaxWidth,
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
      <PageContainer maxW={containerMaxWidth} pb={16}>
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

type AdminLayoutPageBottomBarProps = FlexProps & {
  containerMaxWidth?: ContainerProps['maxW'];
};

export const AdminLayoutPageBottomBar = ({
  children,
  containerMaxWidth,
  ...rest
}: AdminLayoutPageBottomBarProps) => {
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
        boxShadow="layout"
        bg="white"
        borderTop="1px solid transparent"
        _dark={{
          bg: 'gray.900',
          color: 'white',
          borderTopColor: 'gray.800',
          boxShadow: 'layout-dark',
        }}
        {...rest}
      >
        <PageContainer maxW={containerMaxWidth}>{children}</PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </>
  );
};

type AdminLayoutPageProps = FlexProps & {
  showNavBar?: AdminLayoutContextNavDisplayed;
  containerMaxWidth?: ContainerProps['maxW'];
  noContainer?: boolean;
  nav?: React.ReactNode;
};

export const AdminLayoutPage = ({
  showNavBar = true,
  noContainer = false,
  containerMaxWidth = 'container.lg',
  nav = null,
  ...rest
}: AdminLayoutPageProps) => {
  useAdminLayoutHideNav(showNavBar);

  const value = useMemo(
    () => ({
      nav,
      noContainer,
      containerMaxWidth,
    }),
    [containerMaxWidth, noContainer, nav]
  );

  return (
    <AdminLayoutPageContext.Provider value={value}>
      <Flex direction="column" flex="1" position="relative" {...rest} />
    </AdminLayoutPageContext.Provider>
  );
};
