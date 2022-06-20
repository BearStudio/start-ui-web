import React, { useState } from 'react';

import { Center, Stack, Text } from '@chakra-ui/react';
import { FiImage } from 'react-icons/fi';

import { Icon } from '@/components/Icons';
import { ImageUpload } from '@/components/ImageUpload';

export default {
  title: 'Components/ImageUpload',
};

export const Default = () => {
  const [imageUrl, setImageUrl] = useState<string>('');

  return (
    <Stack>
      <ImageUpload value={imageUrl} onChange={setImageUrl} w="240px" />
      <ImageUpload value={imageUrl} onChange={setImageUrl} w="360px" />
      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        w="480px"
        ratio={1}
      />
    </Stack>
  );
};

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

  const [imageUrl, setImageUrl] = useState<string>('');

  return (
    <Stack>
      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        placeholder={<PlaceholderComponent />}
        w="360px"
      />
    </Stack>
  );
};
