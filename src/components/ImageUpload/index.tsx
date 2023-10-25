import { InputHTMLAttributes, ReactNode } from 'react';

import { Box, ChakraProps, chakra } from '@chakra-ui/react';

export type ImageUploadProps = ChakraProps & {
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  children: ReactNode;
};

export const ImageUpload = ({
  children,
  onChange,
  ...props
}: ImageUploadProps) => {
  return (
    <Box
      as="label"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      cursor="pointer"
      {...props}
    >
      {children}
      <chakra.input
        opacity={0}
        position="absolute"
        top={0}
        left={0}
        width={0}
        type="file"
        onChange={onChange}
      />
    </Box>
  );
};
