import React, { FC, useCallback, useEffect, useState } from 'react';

import { Box, Flex, FlexProps, IconButton } from '@chakra-ui/react';
import { useFormContext, useFormFields } from '@formiz/core';
import { LuX } from 'react-icons/lu';

import { FieldUploadValue } from '@/components/FieldUpload';

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
  React.PropsWithChildren<FieldUploadPreviewProps>
> = ({ uploaderName, ...rest }) => {
  const fields = useFormFields({
    fields: [uploaderName] as const, // To get the uploader values
  });
  const form = useFormContext();

  const [fileToPreview, setFileToPreview] = useState<string>();

  const previewFile = useCallback(async () => {
    const uploaderFieldValue = fields?.[uploaderName]
      ?.value as FieldUploadValue;

    if (
      !uploaderFieldValue ||
      (!uploaderFieldValue.fileUrl && !uploaderFieldValue.file)
    ) {
      setFileToPreview(undefined);
      return;
    }

    const hasUserUploadedAFile = uploaderFieldValue.file;
    const hasDefaultFileSet =
      uploaderFieldValue.fileUrl && !hasUserUploadedAFile;

    if (hasDefaultFileSet) {
      setFileToPreview(uploaderFieldValue.fileUrl);
      return;
    }

    const uploadedFileToPreview = await new Promise<string>(
      (resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString() ?? '');
        reader.onerror = reject;
        if (uploaderFieldValue.file) {
          reader.readAsDataURL(uploaderFieldValue.file);
        }
      }
    );

    setFileToPreview(uploadedFileToPreview);
  }, [fields, uploaderName]);

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
            form.setValues({ [uploaderName]: null });
          }}
        />
      </Flex>
    )
  );
};
