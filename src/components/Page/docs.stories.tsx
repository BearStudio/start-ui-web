import React from 'react';

import { Center, Flex } from '@chakra-ui/react';
import { Meta } from '@storybook/react';

import { Layout } from '@/layout/Layout';

import { Page, PageBottomBar, PageContent, PageTopBar } from './index';

export default {
  title: 'Components/Page',
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => {
      return (
        <Flex
          h="100vh"
          transform="scale(1)"
          bg="white"
          _dark={{ bg: 'gray.800' }}
        >
          <Layout>
            <Story />
          </Layout>
        </Flex>
      );
    },
  ],
} satisfies Meta;

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

export const FocusFixedPageTopBar = () => (
  <Page isFocusMode>
    <PageTopBar showBack isFixed onBack={() => alert('Back')}>
      Page Top Bar
    </PageTopBar>
    <PageContent>
      <Center h={800} borderWidth={1}>
        Page Content
      </Center>
    </PageContent>
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
