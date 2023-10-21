import React, { useContext, useMemo } from 'react';

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
  noContainer: boolean;
  containerMaxWidth: ContainerProps['maxW'];
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

const PageContainer = ({ children, maxW, ...rest }: ContainerProps) => {
  const { noContainer, containerMaxWidth } = useAppLayoutPageContext();

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

type AppLayoutPageProps = FlexProps & {
  showNavBar?: AppLayoutContextNavDisplayed;
  containerMaxWidth?: ContainerProps['maxW'];
  noContainer?: boolean;
  nav?: React.ReactNode;
};

export const AppLayoutPage = ({
  showNavBar = true,
  noContainer = false,
  containerMaxWidth = 'container.md',
  children,
  ...rest
}: AppLayoutPageProps) => {
  useAppLayoutHideNav(showNavBar);

  const value = useMemo(
    () => ({
      noContainer,
      containerMaxWidth: containerMaxWidth,
    }),
    [containerMaxWidth, noContainer]
  );

  return (
    <AppLayoutPageContext.Provider value={value}>
      <Flex
        position="relative"
        zIndex="1"
        direction="column"
        flex="1"
        pt="safe-top"
        {...rest}
      >
        <PageContainer pt={4} pb={16}>
          {children}
        </PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </AppLayoutPageContext.Provider>
  );
};
