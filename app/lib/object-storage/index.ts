import { minio } from 'better-upload/server/helpers';

const client = minio({
  region: 'your-minio-region',
  endpoint: 'https://minio.example.com'
  accessKeyId: 'your-access-key-id',
  secretAccessKey: 'your-secret-access-key',
});
