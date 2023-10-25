import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { Box, Flex, type FlexProps, IconButton } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { LuX } from 'react-icons/lu';

const ImagePreview = ({
  image,
  onClick,
}: {
  image: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <Box
      position="relative"
      bg="gray.200"
      height="100%"
      aspectRatio="1"
      overflow="hidden"
      rounded="md"
    >
      <Box as="img" width="100%" height="100%" objectFit="cover" src={image} />
      <IconButton
        position="absolute"
        top="1"
        right="1"
        icon={<LuX fontSize="sm" />}
        aria-label="Remove"
        rounded="full"
        minWidth="6"
        minHeight="6"
        width="6"
        height="6"
        onClick={onClick}
      />
    </Box>
  );
};

export type FieldUploadPreviewProps = FlexProps & {
  uploaderName: string;
};
export const FieldUploadPreview: FC<
  PropsWithChildren<FieldUploadPreviewProps>
> = ({ uploaderName, ...rest }) => {
  const { watch, setValue } = useFormContext();

  const [fileToPreview, setFileToPreview] = useState<string>();

  const value = watch(uploaderName);
  const previewFile = useCallback(async () => {
    if (!value || (!value.fileUrl && !value.file)) {
      setFileToPreview(undefined);
      return;
    }

    const hasUserUploadedAFile = !!value.file;
    const hasDefaultFileSet = !!value.fileUrl && !hasUserUploadedAFile;

    if (hasDefaultFileSet) {
      setFileToPreview(value.fileUrl);
      return;
    }

    const uploadedFileToPreview = await new Promise<string>(
      (resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString() ?? '');
        reader.onerror = reject;
        if (value.file) {
          reader.readAsDataURL(value.file);
        }
      }
    );

    setFileToPreview(uploadedFileToPreview);
  }, [value]);

  useEffect(() => {
    previewFile();
  }, [previewFile]);

  return (
    fileToPreview && (
      <Flex
        mt={2}
        background="white"
        height="32"
        width="full"
        rounded="md"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.200"
        alignItems="center"
        p={4}
        {...rest}
      >
        <ImagePreview
          image={fileToPreview}
          onClick={() => {
            setValue(uploaderName, undefined);
          }}
        />
      </Flex>
    )
  );
};
