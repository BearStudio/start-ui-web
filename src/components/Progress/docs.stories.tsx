import React from 'react';

import { Progress, ProgressBar, ProgressLabel } from '.';

export default {
  title: 'components/Progress',
};

export const Default = () => {
  return (
    <Progress completed={10} total={30}>
      <ProgressLabel>
        {({ completed, total }) => `${completed} tasks completed on ${total}`}
      </ProgressLabel>
      <ProgressBar />
    </Progress>
  );
};

export const Indeterminate = () => {
  return (
    <Progress completed={10} total={30} isLoading>
      <ProgressLabel>
        {({ isLoading: _isLoading }) => `Loading...`}
      </ProgressLabel>
      <ProgressBar />
    </Progress>
  );
};

export const WithCustomStyle = () => {
  return (
    <Progress completed={3} total={5} color="green">
      <ProgressLabel fontWeight="regular" fontSize="xl">
        {({ completed, total }) => `${completed}/${total} tasks done`}
      </ProgressLabel>
      <ProgressBar
        colorScheme="green"
        backgroundColor="red.300"
        height={2}
        borderRadius={0}
      />
    </Progress>
  );
};

export const WithoutLabel = () => {
  return (
    <Progress completed={10} total={30}>
      <ProgressBar />
    </Progress>
  );
};

export const WithoutBar = () => {
  return (
    <Progress completed={10} total={30}>
      <ProgressLabel>
        {({ completed, total }) => `${completed} tasks completed on ${total}`}
      </ProgressLabel>
    </Progress>
  );
};
