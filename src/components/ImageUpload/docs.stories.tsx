import { ChangeEvent } from 'react';

import { Box, Flex, Spinner } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { LuImage } from 'react-icons/lu';

import { Icon } from '@/components/Icons';

import { ImageUpload } from '.';

export default {
  title: 'Components/ImageUpload',
};

const uploadFileMock = async (file: File) => {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.toString() ?? '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }, 1000);
  });
};

export const Default = () => {
  const updateImage = useMutation({
    mutationFn: async (file: File) => {
      return await uploadFileMock(file);
    },
  });

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    updateImage.mutate(file);
  };

  return (
    <ImageUpload
      onChange={handleChange}
      boxSize="14"
      border="1px solid"
      borderColor="gray.500"
      rounded="md"
      overflow="hidden"
    >
      <Flex justify="center" align="center" boxSize="full">
        {!updateImage.isLoading && updateImage.data && (
          <Box as="img" objectFit="cover" src={updateImage.data ?? ''} />
        )}
        {!updateImage.isLoading && !updateImage.data && <Icon icon={LuImage} />}
        {updateImage.isLoading && <Spinner size="sm" />}
      </Flex>
    </ImageUpload>
  );
};
