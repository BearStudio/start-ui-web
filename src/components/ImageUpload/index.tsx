import React, { useRef, useState } from 'react';

import {
  AspectRatio,
  AspectRatioProps,
  Box,
  BoxProps,
  IconButton,
  Image,
  ImageProps,
} from '@chakra-ui/react';
import Uploady from '@rpldy/uploady';
import { FiX } from 'react-icons/fi';

import { DefaultImagePlaceholder } from '@/components/ImageUpload/DefaultImagePlaceholder';
import { ImageUploadInput } from '@/components/ImageUpload/ImageUpload';
import { Loader } from '@/layout/Loader';

export type ImageUploadProps = BoxProps &
  Pick<AspectRatioProps, 'ratio'> & {
    value: string;
    onChange: (url: string) => void;
    onUploadStateChange?: (isUploading: boolean) => void;
    placeholder?: ImageProps['fallback'];
  };

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUploadStateChange = () => undefined,
  placeholder = undefined,
  ratio = 16 / 9,
  ...rest
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // TODO: I think the onChange should handle the upload, and the form value should contain
  // the uploaded picture id (for future ref, like deleting on ccloudinary the uploaded image)
  // and the unique url
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO
  };

  const handleDelete = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFallback = () => {
    // If uploading to cloudinary or loading the image from the url, display
    // the loader.
    if (value || isUploading) {
      return <Loader />;
    }

    return placeholder ?? <DefaultImagePlaceholder />;
  };

  return (
    <Uploady
      destination={{
        url: `https://api.cloudinary.com/v1_1/s${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        params: {
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        },
      }}
    >
      <Box
        position="relative"
        border="1px"
        borderStyle="dashed"
        borderColor="gray.200"
        borderRadius="16px"
        overflow="hidden"
        cursor="pointer"
        transition="border-color 150ms ease-in-out"
        _hover={{ borderColor: 'gray.400' }}
        {...rest}
      >
        <ImageUploadInput ref={fileInputRef} onChange={handleChange} />
        <AspectRatio
          ratio={ratio}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image src={value} fallback={getFallback()} />
        </AspectRatio>
        {!!value && (
          <IconButton
            icon={<FiX />}
            position="absolute"
            top="0"
            right="0"
            size="lg"
            variant="ghost"
            aria-label="Remove photo"
            onClick={handleDelete}
            _active={{ bgColor: 'blackAlpha.600' }}
            _hover={{ bgColor: 'blackAlpha.300' }}
          />
        )}
      </Box>
    </Uploady>
  );
};
