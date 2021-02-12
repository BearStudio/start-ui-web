import React, { FC } from 'react';

import { Textarea, TextareaProps } from '@chakra-ui/react';
import { default as TextareaAutosizeReact } from 'react-textarea-autosize';

export interface TextareaAutosizeProps extends TextareaProps {}

export const TextareaAutosize: FC<TextareaAutosizeProps> = (props) => (
  <Textarea
    as={TextareaAutosizeReact}
    transition="none"
    ml="-0.5rem"
    mr={3}
    px={2}
    py={1}
    minH={4}
    autoFocus
    maxRows={10}
    {...props}
  />
);
