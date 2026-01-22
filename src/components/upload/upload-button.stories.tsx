import type { Meta } from '@storybook/react-vite';
import { UploadIcon } from 'lucide-react';

import { UploadButton } from '@/components/upload/upload-button';

export default {
  title: 'Upload/UploadButton',
} satisfies Meta<typeof UploadButton>;

export const Default = () => {
  return (
    <UploadButton
      uploadRoute="bookCover"
      inputProps={{
        accept: 'image/png,image/jpeg,image/gif',
      }}
      onSuccess={(file) => console.log('uploaded file', file)}
    />
  );
};

export const WithChildren = () => {
  return (
    <div className="flex space-x-2">
      <UploadButton
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
      >
        <UploadIcon />
        Upload a new file
      </UploadButton>

      <UploadButton
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
      >
        Upload a new file
        <UploadIcon />
      </UploadButton>

      <UploadButton
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
      >
        Upload a new file
      </UploadButton>
    </div>
  );
};

export const Disabled = () => {
  return (
    <div className="flex space-x-2">
      <UploadButton
        disabled
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
      >
        <UploadIcon />
        Upload a new file
      </UploadButton>

      <UploadButton
        disabled
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
      >
        Upload a new file
        <UploadIcon />
      </UploadButton>
    </div>
  );
};
