'use client'

import { useState, useCallback } from 'react'
import Cropper, { Area } from 'react-easy-crop'

interface ImageCropperProps {
  imageSrc: string
  aspect: number
  cropShape?: 'rect' | 'round'
  onCropComplete: (croppedImageBlob: Blob) => Promise<void>
  onCancel: () => void
  isUploading?: boolean
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export default function ImageCropper({
  imageSrc,
  aspect,
  cropShape = 'rect',
  onCropComplete,
  onCancel,
  isUploading = false,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      const image = await createImage(imageSrc)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      const { width, height, x, y } = croppedAreaPixels

      // Set canvas size based on aspect ratio
      // For avatar: 512x512, for cover: 1536x512 (3:1)
      const outputSize = aspect === 1 ? 512 : 1536
      const outputWidth = aspect === 1 ? outputSize : outputSize
      const outputHeight = aspect === 1 ? outputSize : outputSize / 3

      canvas.width = outputWidth
      canvas.height = outputHeight

      // Draw the cropped image
      ctx.drawImage(image, x, y, width, height, 0, 0, outputWidth, outputHeight)

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/jpeg',
          0.9
        )
      })

      await onCropComplete(blob)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Failed to crop image')
    }
  }, [imageSrc, croppedAreaPixels, aspect, onCropComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Cancel"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">Crop Image</h2>
          </div>
          <button
            onClick={getCroppedImage}
            disabled={isUploading || !croppedAreaPixels}
            className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Save'}
          </button>
        </div>

        {/* Cropper */}
        <div className="relative flex-1 bg-gray-900" style={{ minHeight: '400px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-4 border-t border-gray-200">
          {/* Zoom Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
              disabled={isUploading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

