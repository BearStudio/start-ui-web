'use client';

import { useColorModeValue, useToken } from '@chakra-ui/react';
import HolyLoader from 'holy-loader';

import {
  devEnvHintColorScheme,
  isDevEnvHintVisible,
} from '@/features/devtools/DevEnvHint';

export type NextLoaderProps = {
  darkColor?: string;
  lightColor?: string;
  showSpinner?: boolean;
};
export const NextLoader = ({
  lightColor = 'gray.900',
  darkColor = 'gray.300',
  showSpinner = false,
}: NextLoaderProps) => {
  const loaderColorKey = useColorModeValue(
    isDevEnvHintVisible ? `${devEnvHintColorScheme}.900` : lightColor,
    isDevEnvHintVisible ? `${devEnvHintColorScheme}.900` : darkColor
  );
  const loaderColor = useToken('colors', loaderColorKey);
  return (
    <HolyLoader
      height={2}
      zIndex={99999}
      color={loaderColor}
      showSpinner={showSpinner}
    />
  );
};
