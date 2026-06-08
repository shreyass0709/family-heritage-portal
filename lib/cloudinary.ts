import fs from "fs";
import path from "path";
import { UTApi } from "uploadthing/server";
import sharp from "sharp";

/**
 * Uploads an image to UploadThing, converting it to WebP format first (automatically falls back to local storage if token is missing).
 * @param base64Data Image data as base64 string (with or without data URL prefix)
 * @param filename Preferred filename prefix
 * @returns The URL path to the saved image (UploadThing URL or local absolute web path)
 */
export async function uploadImage(base64Data: string, filename?: string): Promise<string> {
  const token = process.env.UPLOADTHING_TOKEN;

  if (!token) {
    throw new Error("UPLOADTHING_TOKEN is not configured in environment variables.");
  }

  try {
    // 1. Parse and extract buffer
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(cleanBase64, "base64");
    }

    // 2. Convert to WebP using sharp
    console.log("Converting image to WebP format using sharp...");
    const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
    const safePrefix = filename ? filename.toLowerCase().replace(/[^a-z0-9]/g, "_") : "photo";

    // 3. Upload to UploadThing
    try {
      const utapi = new UTApi();
      const file = new File([new Uint8Array(webpBuffer)], `${safePrefix}.webp`, { type: "image/webp" });
      
      console.log(`Uploading file ${safePrefix}.webp to UploadThing...`);
      const response = await utapi.uploadFiles([file]);
      
      if (response && response[0] && response[0].data) {
        console.log(`Uploaded successfully. URL: ${response[0].data.url}`);
        return response[0].data.url;
      }
      
      const errMsg = response && response[0] && response[0].error ? response[0].error.message : "Unknown error";
      throw new Error(errMsg);
    } catch (err: any) {
      console.error("UploadThing API upload failed:", err);
      throw new Error(`UploadThing upload failed: ${err.message || err}`);
    }
  } catch (err: any) {
    console.error("Error processing image conversion/upload:", err);
    throw new Error(err.message || "Image processing failed");
  }
}

