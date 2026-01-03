"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"

interface ImageUploadZoneProps {
    onUploadComplete: (urls: string[]) => void
    maxFiles?: number
}

// Simple Cloudinary Unsigned Upload
// NOTE: In production, use signed uploads via server action for security.
// For this MVP drag-drop, using generic unsigned preset if available, 
// OR simpler: we'll simulate the upload or use a server action wrapper if you prefer.
// Given strict "implement cloudinary thing", likely refers to `lib/cloudinary` usage.
// Since `lib/cloudinary` is server-side usually, we'll try a server action approach 
// where we convert file to base64 or FormData and send to server.

import { uploadImageAction } from "@/app/actions/image-upload" // We'll create this next

export function ImageUploadZone({ onUploadComplete, maxFiles = 3 }: ImageUploadZoneProps) {
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Limit files
        const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
        setFiles(newFiles)

        // Generate previews
        const newPreviews = newFiles.map(file => URL.createObjectURL(file))
        setPreviews(newPreviews)
    }, [files, maxFiles])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles
    })

    const removeFile = (index: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const newFiles = [...files]
        newFiles.splice(index, 1)
        setFiles(newFiles)

        const newPreviews = [...previews]
        URL.revokeObjectURL(newPreviews[index]) // Cleanup
        newPreviews.splice(index, 1)
        setPreviews(newPreviews)
    }

    const handleUpload = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent dropzone click
        if (files.length === 0) return

        setIsUploading(true)
        try {
            const uploadedUrls: string[] = []

            // Upload sequentially or parallel
            for (const file of files) {
                // Prepare FormData
                const formData = new FormData()
                formData.append("file", file)

                // Call Server Action
                // Note: Passing FormData to Server Actions is supported in Next.js
                const result = await uploadImageAction(formData)
                if (result.success && result.url) {
                    uploadedUrls.push(result.url)
                } else {
                    console.error("Upload failed for file:", file.name)
                }
            }

            if (uploadedUrls.length > 0) {
                onUploadComplete(uploadedUrls)
                // Clear state
                setFiles([])
                setPreviews([])
            }
        } catch (error) {
            console.error("Upload error:", error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"}
                `}
            >
                <input {...getInputProps()} />

                {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-white/50 py-4">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm font-medium">Drag & drop photos here</p>
                        <p className="text-xs">or click to browse (Max {maxFiles})</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        {previews.map((src, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={(e) => removeFile(idx, e)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* Add More placeholder if space */}
                        {files.length < maxFiles && (
                            <div className="aspect-square flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors">
                                <PlusIcon className="w-5 h-5" />
                                <span className="text-[10px] mt-1">Add</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-4 h-4" /> Confirm Upload ({files.length})
                        </>
                    )}
                </button>
            )}
        </div>
    )
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
