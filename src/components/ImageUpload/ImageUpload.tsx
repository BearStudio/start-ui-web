import { Input, InputProps, forwardRef } from '@chakra-ui/react';
import { useFileInput } from '@rpldy/uploady';

export const ImageUploadInput = forwardRef<InputProps, 'input'>(
  (props, ref) => {
    useFileInput(ref as ExplicitAny);
    return <Input ref={ref} type="file" display="none" {...props} />;
  }
);
