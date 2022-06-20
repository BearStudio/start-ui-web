import { Box, Button, Center, Stack, Tag, Text } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { FiImage } from 'react-icons/fi';

import { FieldImageUpload } from '@/components/FieldImageUpload';
import { Icon } from '@/components/Icons';

export default {
  title: 'Fields/FieldImageUpload',
};

export const Default = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={6}>
      <FieldImageUpload
        name="demo"
        label="Profil picture"
        helper="This is an helper"
        required="Profil picture is required"
        width="360px"
      />
      <FieldImageUpload
        name="demo-default-value"
        label="Default value"
        defaultValue="https://bit.ly/dan-abramov"
        width="360px"
      />
      <FieldImageUpload
        name="demo-ratio"
        label="Custom aspect ratio and size"
        imageUploadProps={{ ratio: 1 }}
        w="240px"
      />
      <Box>
        <Button type="submit">Submit</Button>
      </Box>
    </Stack>
  </Formiz>
);

export const CustomPlaceholder = () => {
  const PlaceholderComponent = () => (
    <Center bgColor="gray.50" overflow="hidden">
      <Stack textAlign="center" spacing={2}>
        <Icon
          fontSize="48px"
          textColor="gray.400"
          icon={FiImage}
          alignSelf="center"
        />
        <Text textColor="gray.600" fontWeight="medium" fontSize="md">
          Upload a photo
        </Text>
      </Stack>
    </Center>
  );

  return (
    <Formiz onSubmit={console.log} autoForm>
      <Stack spacing={6}>
        <FieldImageUpload
          name="demo"
          label="Image with placeholder"
          imageUploadProps={{ placeholder: <PlaceholderComponent /> }}
          w="480px"
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const InvalidateFormWhileUploading = () => {
  const form = useForm();

  return (
    <Formiz connect={form} onSubmit={console.log} autoForm>
      <Stack spacing={2}>
        <FieldImageUpload
          name="demo"
          label="Invalidate during uploading"
          w="360px"
          imageUploadProps={{
            onUploadStateChange: (isUploading) =>
              isUploading &&
              form.invalidateFields({ demo: 'Image is uploading' }),
          }}
        />
        <Box>
          {form.isValid ? (
            <Tag size="lg" colorScheme="green">
              Valid
            </Tag>
          ) : (
            <Tag size="lg" colorScheme="red">
              Invalid
            </Tag>
          )}
        </Box>
        <Box>
          <Button type="submit" isDisabled={!form.isValid && form.isSubmitted}>
            Submit
          </Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
