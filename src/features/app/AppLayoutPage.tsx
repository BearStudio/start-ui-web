import React, { ReactNode, useContext, useMemo } from 'react';

import {
  Box,
  Container,
  ContainerProps,
  Flex,
  FlexProps,
} from '@chakra-ui/react';

import {
  AppLayoutContextNavDisplayed,
  useAppLayoutHideNav,
} from '@/features/app/AppLayout';

type AppLayoutPageContextValue = {
  hideContainer: boolean;
  containerSize: ContainerProps['maxW'];
};

const AppLayoutPageContext =
  React.createContext<AppLayoutPageContextValue | null>(null);

const useAppLayoutPageContext = () => {
  const context = useContext(AppLayoutPageContext);
  if (context === null) {
    throw new Error('Missing parent <AppLayoutPage> component');
  }
  return context;
};

const PageContainer = ({ children }: { children: ReactNode }) => {
  const { hideContainer, containerSize } = useAppLayoutPageContext();

  if (hideContainer) return <>{children}</>;
  return <Container maxW={containerSize}>{children}</Container>;
};

type AppLayoutPageProps = FlexProps & {
  showNavBar?: AppLayoutContextNavDisplayed;
  containerSize?: ContainerProps['maxW'];
  hideContainer?: boolean;
  nav?: React.ReactNode;
};

export const AppLayoutPage = ({
  showNavBar = true,
  hideContainer = false,
  containerSize = undefined,
  children,
  ...rest
}: AppLayoutPageProps) => {
  useAppLayoutHideNav(showNavBar);

  const value = useMemo(
    () => ({
      hideContainer,
      containerSize,
    }),
    [containerSize, hideContainer]
  );

  return (
    <AppLayoutPageContext.Provider value={value}>
      <Flex
        position="relative"
        zIndex="1"
        direction="column"
        flex="1"
        py={6}
        {...rest}
      >
        <PageContainer>{children}</PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </AppLayoutPageContext.Provider>
  );
};
