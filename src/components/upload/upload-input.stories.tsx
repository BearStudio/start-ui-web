import type { StoryDefault } from '@ladle/react';
import { toast } from 'sonner';

import { UploadInput } from './upload-input';

export default {
  title: 'Upload/UploadInput',
} satisfies StoryDefault;

export const Default = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in ladle')}
    />
  );
};

export const WithDocument = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      defaultValue={{ name: 'document.txt' }}
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in ladle')}
    />
  );
};

export const WithImage = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      defaultValue={{
        name: 'cover.jpg',
        url: 'https://picsum.photos/seed/ladle/200/200',
      }}
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in ladle')}
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
      onError={() => toast.error('Cannot upload in ladle')}
    />
  );
};

export const CustomPlaceholder = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      placeholder="Upload your document..."
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in ladle')}
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
        onError={() => toast.error('Cannot upload in ladle')}
      />
      <UploadInput
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in ladle')}
      />
      <UploadInput
        size="lg"
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in ladle')}
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
      onError={() => toast.error('Cannot upload in ladle')}
    />
  );
};
