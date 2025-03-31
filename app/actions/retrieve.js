"use server"
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function retrieveData(code) {
  try {
    const data = await prisma.clipboard.findUnique({
      where: { code },
    });
    
    if (!data) {
      return null;
    }
    
    // Determine the type based on what data is present
    const type = data.fileUrl ? "file" : "text";
    
    // Format the data to match what the component expects
    return {
      type: type,
      content: data.text || "",
      fileName: data.fileUrl ? data.publicId || "file" : null,
      fileUrl: data.fileUrl || null
    };
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to retrieve data");
  }
}