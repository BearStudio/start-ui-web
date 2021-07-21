import React from 'react';

import { Flex } from '@chakra-ui/react';

import { Layout } from '@/app/layout';
import { useDarkMode } from '@/hooks/useDarkMode';

import { Page, PageTopBar, PageContent, PageBottomBar } from './index';

export default {
  title: 'App Layout/Page',
  decorators: [
    (Story) => {
      const { colorModeValue } = useDarkMode();
      return (
        <Flex
          bg={colorModeValue('white', 'gray.800')}
          h="100vh"
          transform="scale(1)"
        >
          <Layout>
            <Story />
          </Layout>
        </Flex>
      );
    },
  ],
};

export const Default = () => (
  <Page>
    <PageTopBar>Page Top Bar</PageTopBar>
    <PageContent>Page Content</PageContent>
    <PageBottomBar>Page Bottom Bar</PageBottomBar>
  </Page>
);

export const FocusAndBackButton = () => (
  <Page isFocusMode>
    <PageTopBar showBack onBack={() => alert('Back')}>
      Page Top Bar
    </PageTopBar>
    <PageContent>Page Content</PageContent>
    <PageBottomBar>Page Bottom Bar</PageBottomBar>
  </Page>
);

export const ContainerSizeSmall = () => (
  <Page containerSize="sm">
    <PageTopBar>Page Top Bar</PageTopBar>
    <PageContent>Page Content</PageContent>
    <PageBottomBar>Page Bottom Bar</PageBottomBar>
  </Page>
);

export const ContainerSizeMedium = () => (
  <Page containerSize="md">
    <PageTopBar>Page Top Bar</PageTopBar>
    <PageContent>Page Content</PageContent>
    <PageBottomBar>Page Bottom Bar</PageBottomBar>
  </Page>
);

export const ContainerSizeLarge = () => (
  <Page containerSize="lg">
    <PageTopBar>Page Top Bar</PageTopBar>
    <PageContent>Page Content</PageContent>
    <PageBottomBar>Page Bottom Bar</PageBottomBar>
  </Page>
);

export const ContainerSizeFull = () => (
  <Page containerSize="full">
    <PageTopBar>Page Top Bar</PageTopBar>
    <PageContent>Page Content</PageContent>
    <PageBottomBar>Page Bottom Bar</PageBottomBar>
  </Page>
);

export const NoContainer = () => (
  <Page hideContainer>
    <PageTopBar>Page Top Bar</PageTopBar>
    <PageContent>Page Content</PageContent>
    <PageBottomBar>Page Bottom Bar</PageBottomBar>
  </Page>
);
