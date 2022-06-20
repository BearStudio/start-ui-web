import React, { useRef, useState } from 'react';

import {
  AspectRatio,
  AspectRatioProps,
  Box,
  BoxProps,
  IconButton,
  Image,
  ImageProps,
  Input,
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

import { Loader } from '@/app/layout';
import { DefaultImagePlaceholder } from '@/components/ImageUpload/DefaultImagePlaceholder';
import { uploadFile } from '@/components/ImageUpload/cloudinary.service';

export type ImageUploadProps = Omit<BoxProps, 'onChange' | 'placeholder'> &
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      onUploadStateChange(true);

      const imageUrl = await uploadFile(file);
      console.log({ imageUrl });
      onChange(imageUrl);
    } catch (err) {
      console.error(err);
    } finally {
      onUploadStateChange(false);
      setIsUploading(false);
    }
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
      <Input
        ref={fileInputRef}
        type="file"
        display="none"
        onChange={handleChange}
      />
      <AspectRatio ratio={ratio} onClick={() => fileInputRef.current?.click()}>
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
  );
};
