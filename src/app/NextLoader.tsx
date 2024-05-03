'use client';

import { useColorModeValue, useToken } from '@chakra-ui/react';
import HolyLoader from 'holy-loader';

import { env } from '@/env.mjs';

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
    env.NEXT_PUBLIC_ENV_NAME
      ? `${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.900`
      : lightColor,
    env.NEXT_PUBLIC_ENV_COLOR_SCHEME
      ? `${env.NEXT_PUBLIC_ENV_COLOR_SCHEME}.900`
      : darkColor
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
