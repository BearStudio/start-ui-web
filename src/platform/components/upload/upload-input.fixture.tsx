import { toast } from 'sonner';

import { UploadInput } from './upload-input';
const Default = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in Cosmos')}
    />
  );
};

const WithDocument = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      defaultValue={{ name: 'document.txt' }}
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in Cosmos')}
    />
  );
};

const WithImage = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      defaultValue={{
        name: 'cover.jpg',
        url: 'https://picsum.photos/seed/cosmos/200/200',
      }}
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in Cosmos')}
    />
  );
};

const WithAcceptFilter = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      inputProps={{
        accept: 'image/png,image/jpeg,image/gif',
      }}
      placeholder="Drop an image here, or click to browse"
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in Cosmos')}
    />
  );
};

const CustomPlaceholder = () => {
  return (
    <UploadInput
      uploadRoute="bookCover"
      placeholder="Upload your document..."
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in Cosmos')}
    />
  );
};

const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <UploadInput
        size="sm"
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      />
      <UploadInput
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      />
      <UploadInput
        size="lg"
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      />
    </div>
  );
};

const Disabled = () => {
  return (
    <UploadInput
      disabled
      uploadRoute="bookCover"
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in Cosmos')}
    />
  );
};

export default {
  Default,
  WithDocument,
  WithImage,
  WithAcceptFilter,
  CustomPlaceholder,
  Sizes,
  Disabled,
};
