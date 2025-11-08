'use client'

import React, { useState, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary'

interface MediaUploaderProps {
  onUpload: (url: string, type: 'image' | 'video') => void
  existingUrl?: string | null
  type?: 'avatar' | 'cover' | 'post'
  disabled?: boolean
}

export default function MediaUploader({
  onUpload,
  existingUrl,
  type = 'post',
  disabled = false,
}: MediaUploaderProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl || null)
  const [uploadedType, setUploadedType] = useState<'image' | 'video' | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setUploadedUrl(existingUrl || null)
  }, [existingUrl])

  const handleUploadSuccess = (result: any) => {
    setIsUploading(false)
    if (result?.info?.secure_url) {
      const url = result.info.secure_url
      const resourceType = result.info.resource_type // 'image' or 'video'
      const mediaType: 'image' | 'video' = resourceType === 'video' ? 'video' : 'image'
      
      setUploadedUrl(url)
      setUploadedType(mediaType)
      onUpload(url, mediaType)
    }
  }

  const handleRemove = () => {
    setUploadedUrl(null)
    setUploadedType(null)
    onUpload('', 'image') // Pass empty string to indicate removal
  }

  // Get upload options based on type
  const getUploadOptions = () => {
    const baseOptions: any = {
      sources: ['local', 'camera'],
      multiple: false,
      maxFileSize: type === 'post' ? 10000000 : 5000000, // 10MB for posts, 5MB for avatar/cover
    }

    if (type === 'avatar') {
      return {
        ...baseOptions,
        cropping: true,
        croppingAspectRatio: 1,
        croppingDefaultSelectionRatio: 0.9,
        croppingShowDimensions: true,
        croppingCoordinatesMode: 'custom',
        croppingFreeAspectRatio: false,
        resourceType: 'image',
        maxFileSize: 5000000,
        showAdvancedOptions: false,
        folder: 'avatars',
      }
    }

    if (type === 'cover') {
      return {
        ...baseOptions,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        croppingDefaultSelectionRatio: 0.9,
        croppingShowDimensions: true,
        croppingCoordinatesMode: 'custom',
        croppingFreeAspectRatio: false,
        resourceType: 'image',
        maxFileSize: 5000000,
        showAdvancedOptions: false,
        folder: 'covers',
      }
    }

    // post type
    return {
      ...baseOptions,
      resourceType: 'auto', // Allow both image and video
      maxFileSize: 10000000,
    }
  }

  // Avatar: X-style - click avatar area to show camera icon overlay
  if (type === 'avatar') {
    return (
      <div className="relative">
        <CldUploadWidget
          uploadPreset="my_Xclone"
          onSuccess={handleUploadSuccess}
          onOpen={() => setIsUploading(true)}
          options={getUploadOptions()}
        >
          {({ open }) => (
            <div
              onClick={(e) => {
                e.stopPropagation()
                if (!disabled && !isUploading) open()
              }}
              className="relative group cursor-pointer"
            >
              {uploadedUrl ? (
                <img
                  src={uploadedUrl}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300" />
              )}
              {/* Camera icon overlay on hover - X style */}
              {!disabled && (
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
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
          )}
        </CldUploadWidget>
      </div>
    )
  }

  // Cover: X-style - hover to show edit button
  if (type === 'cover') {
    return (
      <div className="relative">
        <CldUploadWidget
          uploadPreset="my_Xclone"
          onSuccess={handleUploadSuccess}
          onOpen={() => setIsUploading(true)}
          options={getUploadOptions()}
        >
          {({ open }) => (
            <div className="relative group h-48">
              {uploadedUrl ? (
                <img
                  src={uploadedUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              {/* Edit button overlay on hover - X style */}
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isUploading) open()
                    }}
                    disabled={isUploading}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
        </CldUploadWidget>
      </div>
    )
  }

  // Post media: X-style - icon in toolbar, preview below textarea
  return (
    <div>
      {uploadedUrl ? (
        <div className="relative mt-4 rounded-2xl overflow-hidden">
          {uploadedType === 'video' ? (
            <video
              src={uploadedUrl}
              controls
              className="w-full max-h-96 object-cover"
            />
          ) : (
            <img
              src={uploadedUrl}
              alt="Media preview"
              className="w-full max-h-96 object-cover"
            />
          )}
          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
              aria-label="Remove media"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset="my_Xclone"
          onSuccess={handleUploadSuccess}
          onOpen={() => setIsUploading(true)}
          options={getUploadOptions()}
        >
          {({ open }) => (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (!disabled && !isUploading) open()
              }}
              disabled={disabled || isUploading}
              className="p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add media"
            >
              {isUploading ? (
                <svg
                  className="animate-spin h-5 w-5"
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
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22h-.003c-.2 0-.393.08-.532.224l-4.317 4.384-1.813-1.806c-.14-.14-.33-.22-.53-.22-.193-.03-.395.08-.535.227L3.5 17.642V4.25c0-.413.337-.75.75-.75zm-.744 16.28l5.418-5.534 6.282 6.254H4.25c-.402 0-.727-.322-.744-.72zm16.244.72h-2.42l-5.007-4.987 3.792-3.85 4.385 4.384v3.705c0 .413-.337.75-.75.75z" />
                  <circle cx="8.868" cy="8.309" r="1.542" />
                </svg>
              )}
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  )
}
