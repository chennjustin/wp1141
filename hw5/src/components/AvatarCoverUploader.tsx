'use client'

import { useState, useRef } from 'react'
import ImageCropper from './ImageCropper'

interface AvatarCoverUploaderProps {
  type: 'avatar' | 'cover'
  existingUrl?: string | null
  onUpload: (url: string) => Promise<void>
  disabled?: boolean
  userId: string
}

export default function AvatarCoverUploader({
  type,
  existingUrl,
  onUpload,
  disabled = false,
  userId,
}: AvatarCoverUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Clear previous image
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file)
    setImageSrc(objectUrl)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true)
    try {
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', croppedBlob)
      formData.append('type', type)
      formData.append('userId', userId)

      const response = await fetch('/api/upload/cropped', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const data = await response.json()
      
      // Clean up object URL
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc)
      }
      setImageSrc(null)

      // Update parent component
      await onUpload(data.secure_url)
    } catch (error) {
      console.error('Error uploading cropped image:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelCrop = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc)
    }
    setImageSrc(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const aspect = type === 'avatar' ? 1 : 3
  const cropShape = type === 'avatar' ? 'round' : 'rect'

  // Avatar UI
  if (type === 'avatar') {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onClick={handleClick}
          className="relative group cursor-pointer"
        >
          {existingUrl ? (
            <img
              src={existingUrl}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300" />
          )}
          {/* Camera icon overlay on hover */}
          {!disabled && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <svg
                className="animate-spin h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>
        {imageSrc && (
          <ImageCropper
            imageSrc={imageSrc}
            aspect={aspect}
            cropShape={cropShape}
            onCropComplete={handleCropComplete}
            onCancel={handleCancelCrop}
            isUploading={isUploading}
          />
        )}
      </>
    )
  }

  // Cover UI
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="relative group h-48">
        {existingUrl ? (
          <img
            src={existingUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {/* Edit button overlay on hover */}
        {!disabled && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
            <button
              onClick={handleClick}
              className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-all flex items-center gap-2"
              aria-label="Edit cover photo"
            >
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-900">Edit cover photo</span>
            </button>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-white">Uploading...</span>
            </div>
          </div>
        )}
      </div>
      {imageSrc && (
        <ImageCropper
          imageSrc={imageSrc}
          aspect={aspect}
          cropShape={cropShape}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          isUploading={isUploading}
        />
      )}
    </>
  )
}

