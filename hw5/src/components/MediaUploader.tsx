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
        resourceType: 'image',
        maxFileSize: 5000000,
      }
    }

    if (type === 'cover') {
      return {
        ...baseOptions,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        croppingDefaultSelectionRatio: 0.9,
        resourceType: 'image',
        maxFileSize: 5000000,
      }
    }

    // post type
    return {
      ...baseOptions,
      resourceType: 'auto', // Allow both image and video
      maxFileSize: 10000000,
    }
  }

  if (type === 'avatar') {
    return (
      <div className="relative">
        {uploadedUrl ? (
          <div className="relative group">
            <img
              src={uploadedUrl}
              alt="Avatar preview"
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                        open()
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Change avatar"
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
                    </button>
                  )}
                </CldUploadWidget>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="ml-2 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Remove avatar"
                >
                  <svg
                    className="w-5 h-5 text-red-500"
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
              </div>
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
                  if (!disabled) open()
                }}
                disabled={disabled || isUploading}
                className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload avatar"
              >
                {isUploading ? (
                  <svg
                    className="animate-spin h-8 w-8 text-gray-600"
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
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>
    )
  }

  if (type === 'cover') {
    return (
      <div className="relative">
        {uploadedUrl ? (
          <div className="relative group h-48">
            <img
              src={uploadedUrl}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        open()
                      }}
                      className="px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2"
                      aria-label="Change cover"
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
                      <span className="text-sm font-medium text-gray-900">Change cover</span>
                    </button>
                  )}
                </CldUploadWidget>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="ml-2 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Remove cover"
                >
                  <svg
                    className="w-5 h-5 text-red-500"
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
              </div>
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
                  if (!disabled) open()
                }}
                disabled={disabled || isUploading}
                className="w-full h-48 bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload cover"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="animate-spin h-8 w-8 text-gray-600"
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
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">Add cover photo</span>
                  </div>
                )}
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>
    )
  }

  // post type
  return (
    <div className="mt-4">
      {uploadedUrl ? (
        <div className="relative group">
          {uploadedType === 'video' ? (
            <video
              src={uploadedUrl}
              controls
              className="rounded-xl max-h-80 w-full object-cover"
            />
          ) : (
            <img
              src={uploadedUrl}
              alt="Media preview"
              className="rounded-xl max-h-80 w-full object-cover"
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
                if (!disabled) open()
              }}
              disabled={disabled || isUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add media"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-gray-600"
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
                  <span className="text-sm text-gray-600">Uploading...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">Add photo/video</span>
                </>
              )}
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  )
}

