import { UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

import { UploadButton } from '@/platform/components/upload/upload-button';
const Default = () => {
  return (
    <UploadButton
      uploadRoute="bookCover"
      inputProps={{
        accept: 'image/png,image/jpeg,image/gif',
      }}
      onSuccess={(file) => console.log('uploaded file', file)}
      onError={() => toast.error('Cannot upload in Cosmos')}
    />
  );
};

const WithChildren = () => {
  return (
    <div className="flex space-x-2">
      <UploadButton
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      >
        <UploadIcon />
        Upload a new file
      </UploadButton>

      <UploadButton
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      >
        Upload a new file
        <UploadIcon />
      </UploadButton>

      <UploadButton
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      >
        Upload a new file
      </UploadButton>
    </div>
  );
};

const Disabled = () => {
  return (
    <div className="flex space-x-2">
      <UploadButton
        disabled
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      >
        <UploadIcon />
        Upload a new file
      </UploadButton>

      <UploadButton
        disabled
        uploadRoute="bookCover"
        onSuccess={(file) => console.log('uploaded file', file)}
        onError={() => toast.error('Cannot upload in Cosmos')}
      >
        Upload a new file
        <UploadIcon />
      </UploadButton>
    </div>
  );
};

export default {
  Default,
  WithChildren,
  Disabled,
};
