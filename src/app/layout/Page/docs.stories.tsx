import React from 'react';

import { Flex } from '@chakra-ui/react';

import { Page, PageHeader, PageBody, PageFooter } from './index';

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
    <PageHeader>Page Header</PageHeader>
    <PageBody>Page Body</PageBody>
    <PageFooter>Page Footer</PageFooter>
  </Page>
);

export const FocusAndBackButton = () => (
  <Page isFocusMode>
    <PageHeader showBack onBack={() => alert('Back')}>
      Page Header
    </PageHeader>
    <PageBody>Page Body</PageBody>
    <PageFooter>Page Footer</PageFooter>
  </Page>
);

export const ContainerSizeSmall = () => (
  <Page containerSize="sm">
    <PageHeader bg="gray.100">Page Header</PageHeader>
    <PageBody bg="gray.200">Page Body</PageBody>
    <PageFooter bg="gray.300">Page Footer</PageFooter>
  </Page>
);

export const ContainerSizeMedium = () => (
  <Page containerSize="md">
    <PageHeader bg="gray.100">Page Header</PageHeader>
    <PageBody bg="gray.200">Page Body</PageBody>
    <PageFooter bg="gray.300">Page Footer</PageFooter>
  </Page>
);

export const ContainerSizeLarge = () => (
  <Page containerSize="lg">
    <PageHeader bg="gray.100">Page Header</PageHeader>
    <PageBody bg="gray.200">Page Body</PageBody>
    <PageFooter bg="gray.300">Page Footer</PageFooter>
  </Page>
);

export const ContainerSizeFull = () => (
  <Page containerSize="full">
    <PageHeader bg="gray.100">Page Header</PageHeader>
    <PageBody bg="gray.200">Page Body</PageBody>
    <PageFooter bg="gray.300">Page Footer</PageFooter>
  </Page>
);

export const NoContainer = () => (
  <Page hideContainer>
    <PageHeader bg="gray.100">Page Header</PageHeader>
    <PageBody bg="gray.200">Page Body</PageBody>
    <PageFooter bg="gray.300">Page Footer</PageFooter>
  </Page>
);
