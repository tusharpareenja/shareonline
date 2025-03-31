'use server'

import prisma from '../../lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadData(text, fileData) {
  let code = '';
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (await prisma.clipboard.findUnique({ where: { code } }));

  let fileUrl = null;
  let publicId = null;

  if (fileData && typeof fileData === 'string' && fileData.startsWith('data:image')) {
    try {
      const uploadResult = await cloudinary.uploader.upload(fileData, {
        folder: "clipboard",
        resource_type: 'auto',
        context: 'expiration=2h',
      });

      fileUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file: ' + error.message);
    }
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  const result = await prisma.clipboard.create({
    data: {
      code,
      text: text || '',
      fileUrl,
      publicId,
      expiresAt,
    },
  });

  

  return code;
}
