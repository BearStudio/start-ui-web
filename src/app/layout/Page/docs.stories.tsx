import React from 'react';

import { Flex } from '@chakra-ui/react';

import { Page, PageTopBar, PageContent, PageBottomBar } from './index';

export default {
  title: 'App Layout/Page',
  decorators: [
    (Story) => (
      <Flex h="50vh" transform="scale(1)">
        <Story />
      </Flex>
    ),
  ],
};

export const Default = () => (
  <Page>
    <PageTopBar>Page Header</PageTopBar>
    <PageContent>Page Body</PageContent>
    <PageBottomBar>Page Footer</PageBottomBar>
  </Page>
);

export const FocusAndBackButton = () => (
  <Page isFocusMode>
    <PageTopBar showBack onBack={() => alert('Back')}>
      Page Header
    </PageTopBar>
    <PageContent>Page Body</PageContent>
    <PageBottomBar>Page Footer</PageBottomBar>
  </Page>
);

export const ContainerSizeSmall = () => (
  <Page containerSize="sm">
    <PageTopBar bg="gray.100">Page Header</PageTopBar>
    <PageContent bg="gray.200">Page Body</PageContent>
    <PageBottomBar bg="gray.300">Page Footer</PageBottomBar>
  </Page>
);

export const ContainerSizeMedium = () => (
  <Page containerSize="md">
    <PageTopBar bg="gray.100">Page Header</PageTopBar>
    <PageContent bg="gray.200">Page Body</PageContent>
    <PageBottomBar bg="gray.300">Page Footer</PageBottomBar>
  </Page>
);

export const ContainerSizeLarge = () => (
  <Page containerSize="lg">
    <PageTopBar bg="gray.100">Page Header</PageTopBar>
    <PageContent bg="gray.200">Page Body</PageContent>
    <PageBottomBar bg="gray.300">Page Footer</PageBottomBar>
  </Page>
);

export const ContainerSizeFull = () => (
  <Page containerSize="full">
    <PageTopBar bg="gray.100">Page Header</PageTopBar>
    <PageContent bg="gray.200">Page Body</PageContent>
    <PageBottomBar bg="gray.300">Page Footer</PageBottomBar>
  </Page>
);

export const NoContainer = () => (
  <Page hideContainer>
    <PageTopBar bg="gray.100">Page Header</PageTopBar>
    <PageContent bg="gray.200">Page Body</PageContent>
    <PageBottomBar bg="gray.300">Page Footer</PageBottomBar>
  </Page>
);
