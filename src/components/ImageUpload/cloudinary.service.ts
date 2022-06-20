import axios from 'axios';

const CLOUDINARY_UPLOAD_ENDPOINT = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload an image file to cloudinary using unsigned upload.
 *
 * See .env.example for cloud name and upload preset configuration
 *
 * @param file The image to upload to cloudinary
 * @returns A URL link to the image on cloudinary
 */
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''
  );

  return (
    await axios.post<{ secure_url: string }>(
      CLOUDINARY_UPLOAD_ENDPOINT,
      formData
    )
  )?.secure_url;
};
