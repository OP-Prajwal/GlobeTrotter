"use server"

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (ensure these env vars are set)
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function uploadImageAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Convert file to ArrayBuffer then Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary using a Promise wrapper (stream upload)
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "globetrotter_community", // Organize uploads
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Write buffer to stream
            uploadStream.end(buffer);
        });

        // Return the secure URL
        return { success: true, url: result.secure_url };
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return { success: false, error: "Upload failed" };
    }
}
