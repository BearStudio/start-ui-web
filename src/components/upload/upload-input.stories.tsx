import type { Meta } from '@storybook/react-vite';
import { toast } from 'sonner';

import { UploadInput } from './upload-input';

export default {
  title: 'Upload/UploadInput',
} satisfies Meta<typeof UploadInput>;

export const Default = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in storybook')}
    />
  );
};

export const WithDocument = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      defaultValue={{ name: 'document.txt' }}
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in storybook')}
    />
  );
};

export const WithImage = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      defaultValue={{
        name: 'cover.jpg',
        url: 'https://picsum.photos/seed/storybook/200/200',
      }}
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in storybook')}
    />
  );
};

export const WithAcceptFilter = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      inputProps={{
        accept: 'image/png,image/jpeg,image/gif',
      }}
      placeholder="Drop an image here, or click to browse"
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in storybook')}
    />
  );
};

export const CustomPlaceholder = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      placeholder="Upload your document..."
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in storybook')}
    />
  );
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <UploadInput
        size="sm"
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in storybook')}
      />
      <UploadInput
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in storybook')}
      />
      <UploadInput
        size="lg"
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in storybook')}
      />
    </div>
  );
};

export const Disabled = () => {
  return (
    <UploadInput
      disabled
      uploadRoute="bookCover"
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in storybook')}
    />
  );
};
