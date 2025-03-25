import React, { useContext, useMemo } from 'react';

import {
  Box,
  Container,
  ContainerProps,
  Flex,
  FlexProps,
} from '@chakra-ui/react';
import Scrollbars from 'react-custom-scrollbars-2';

import {
  AppLayoutContextNavDisplayed,
  useAppLayoutHideNav,
} from '@/features/app/AppLayout';

type AppLayoutPageContextValue = {
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
  const { containerMaxWidth } = useAppLayoutPageContext();

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
  containerProps?: ContainerProps;
  nav?: React.ReactNode;
};

export const AppLayoutPage = ({
  showNavBar = true,
  containerMaxWidth = 'container.md',
  containerProps,
  children,
  ...rest
}: AppLayoutPageProps) => {
  useAppLayoutHideNav(showNavBar);

  const value = useMemo(
    () => ({
      containerMaxWidth,
    }),
    [containerMaxWidth]
  );

  return (
    <AppLayoutPageContext.Provider value={value}>
      <Flex
        position="relative"
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
        <PageContainer mt="safe-top" pt={4} pb={16} {...containerProps}>
          {children}
        </PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </AppLayoutPageContext.Provider>
  );
};
