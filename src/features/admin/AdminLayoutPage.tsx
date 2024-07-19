import React, { ReactNode, useContext, useMemo } from 'react';

import {
  Box,
  ButtonGroup,
  Container,
  ContainerProps,
  Flex,
  FlexProps,
  HStack,
  Stack,
} from '@chakra-ui/react';
import Scrollbars from 'react-custom-scrollbars-2';

import {
  AdminLayoutContextNavDisplayed,
  useAdminLayoutHideNav,
} from '@/features/admin/AdminLayout';

type AdminLayoutPageContextValue = {
  nav: React.ReactNode;
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
  const { containerMaxWidth } = useAdminLayoutPageContext();

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
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  isConfirmDiscardChanges?: boolean;
  containerProps?: ContainerProps;
};

export const AdminLayoutPageTopBar = ({
  children,
  leftActions,
  rightActions,
  containerProps,
  ...rest
}: AdminLayoutPageTopBarProps) => {
  return (
    <Flex
      direction="column"
      boxShadow="layout"
      bg="white"
      borderBottom="1px solid transparent"
      borderBottomColor="gray.100"
      _dark={{
        bg: 'gray.900',
        color: 'white',
        borderBottomColor: 'gray.800',
        boxShadow: 'layout-dark',
      }}
      {...rest}
    >
      <PageContainer
        alignItems="center"
        justifyContent="center"
        py={3}
        flex={0}
        {...containerProps}
      >
        <Box w="full" h="0" pb="safe-top" />
        <HStack w="full" spacing="4" justifyContent="center">
          {!!leftActions && (
            <ButtonGroup size="sm" spacing={3}>
              {leftActions}
            </ButtonGroup>
          )}
          <Box flex="1">{children}</Box>
          {!!rightActions && (
            <ButtonGroup size="sm" spacing={3}>
              {rightActions}
            </ButtonGroup>
          )}
        </HStack>
      </PageContainer>
    </Flex>
  );
};

type AdminLayoutPageContentProps = FlexProps & {
  containerProps?: ContainerProps;
};

export const AdminLayoutPageContent = ({
  children,
  containerProps,
  ...rest
}: AdminLayoutPageContentProps) => {
  const { nav } = useAdminLayoutPageContext();
  return (
    <Flex
      as={Scrollbars}
      direction="column"
      flex={1}
      __css={{
        '& > *': {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        },
      }}
      {...rest}
    >
      <PageContainer pb={16} py={4} {...containerProps}>
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
  containerProps?: ContainerProps;
};

export const AdminLayoutPageBottomBar = ({
  children,
  containerProps,
  ...rest
}: AdminLayoutPageBottomBarProps) => {
  return (
    <Flex
      mt="auto"
      direction="column"
      boxShadow="layout"
      bg="white"
      borderTop="1px solid transparent"
      borderTopColor="gray.100"
      {...rest}
    >
      <PageContainer py="3" {...containerProps}>
        <Box w="full" h="0" pb="safe-bottom" />
        <Flex flex={1}>{children}</Flex>
      </PageContainer>
    </Flex>
  );
};

type AdminLayoutPageProps = FlexProps & {
  showNavBar?: AdminLayoutContextNavDisplayed;
  containerMaxWidth?: ContainerProps['maxW'];
  nav?: React.ReactNode;
  children?: React.ReactNode;
};

export const AdminLayoutPage = ({
  showNavBar = true,
  containerMaxWidth = 'container.lg',
  nav = null,
  children,
}: AdminLayoutPageProps) => {
  useAdminLayoutHideNav(showNavBar);

  const value = useMemo(
    () => ({
      nav,
      containerMaxWidth,
    }),
    [containerMaxWidth, nav]
  );

  return (
    <AdminLayoutPageContext.Provider value={value}>
      <Flex direction="column" flex="1">
        {children}
      </Flex>
    </AdminLayoutPageContext.Provider>
  );
};
