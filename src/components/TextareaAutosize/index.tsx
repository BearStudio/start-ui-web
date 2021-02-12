import React, { FC } from 'react';

import { Textarea, TextareaProps } from '@chakra-ui/react';
import { default as TextareaAutosizeReact } from 'react-textarea-autosize';

export interface TextareaAutosizeProps extends TextareaProps {}

export const TextareaAutosize: FC<TextareaAutosizeProps> = (props) => (
  <Textarea as={TextareaAutosizeReact} minH={4} maxRows={10} {...props} />
);
