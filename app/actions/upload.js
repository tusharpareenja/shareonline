'use server'

import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadData(text, fileData) {
  // Generate a unique 4-digit code
  let code = '';
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (await prisma.clipboard.findUnique({ where: { code } }));

  let fileUrl = null;
  let publicId = null;

  if (fileData) {
    try {
      // If the file is already a base64 string, make sure it's properly formatted
      if (typeof fileData === 'string' && fileData.includes('base64')) {
        // Set the resource_type to auto to handle different file types
        const uploadResult = await cloudinary.uploader.upload(fileData, {
          folder: "clipboard",
          // Set a 2-hour expiration for Cloudinary files
          resource_type: 'auto',
          // Store the timestamp for expiration
          context: `expiration=2h`
        });
        fileUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } else {
        throw new Error('Invalid file format');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file: ' + error.message);
    }
  }

  // Calculate expiration time (2 hours from now)
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  // Create record in database
  const result = await prisma.clipboard.create({
    data: {
      code,
      text: text || '',
      fileUrl,
      publicId, // Store the public_id to help with cleanup
      expiresAt, // Set to 2 hours from now
    },
  });

  // Schedule cleanup task (this is a simplified approach; 
  // in a real-world scenario, you'd use a cron job or task scheduler)
  scheduleDeletion(code, publicId, expiresAt);

  // Revalidate any paths that might show this content
  revalidatePath('/share');
  
  return code;
}

// Function to handle deletion after expiration
async function scheduleDeletion(code, publicId, expiresAt) {
  const timeUntilExpiration = expiresAt.getTime() - Date.now();

  // This is a simple setTimeout approach
  // In production, you would use a proper task scheduler like Bull or a cron job
  setTimeout(async () => {
    try {
      // Delete from database
      await prisma.clipboard.delete({
        where: { code },
      }).catch(e => console.log(`Database record ${code} already deleted or not found`));

      // Delete from Cloudinary if there was a file
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
          .catch(e => console.log(`Cloudinary file ${publicId} already deleted or not found`));
      }

      console.log(`Successfully deleted expired content with code: ${code}`);
    } catch (error) {
      console.error(`Error deleting expired content with code ${code}:`, error);
    }
  }, timeUntilExpiration);
}