'use client';

import { cloneElement } from 'react';

import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/react';

import { DarkModeSwitch } from '@/components/DarkModeSwitch';
import { env } from '@/env.mjs';

export const EnvHintDevPopover: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  if (!env.NEXT_PUBLIC_ENV_NAME || !children) {
    return null;
  }

  const childrenAsButton = cloneElement(children, { as: 'button' });

  return (
    <Popover closeOnBlur closeOnEsc>
      <PopoverTrigger>{childrenAsButton}</PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader mb={2}>Development helper</PopoverHeader>
        <PopoverBody>
          <DarkModeSwitch />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
