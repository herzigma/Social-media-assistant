import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon, ExpandIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (base64Data: string, mimeType: string) => void;
  onImageClick: () => void;
  uploadedImage: {data: string; mimeType: string} | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onImageClick, uploadedImage }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadedImage) {
      setImagePreview(`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`);
    } else {
      setImagePreview(null);
    }
  }, [uploadedImage]);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageUpload(base64String, file.type);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 transition-all duration-300">
        <h2 className="text-xl font-semibold text-white mb-4">1. Upload Screenshot</h2>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept="image/*"
            className="hidden"
        />
       
        <div className="relative">
             <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!imagePreview ? handleUploadAreaClick : undefined}
                className={`flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg transition-colors duration-300
                ${isDragging ? 'border-indigo-500 bg-gray-800' : 'border-gray-700'}
                ${!imagePreview && 'hover:border-gray-600 cursor-pointer'}
                ${imagePreview ? 'p-0 border-solid' : 'p-4'}`}
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Screenshot preview" className="object-contain w-full h-full rounded-md" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                        <UploadIcon className="w-12 h-12 text-gray-500 mb-2" />
                        <p className="text-gray-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                )}
            </div>
            {imagePreview && (
                <button
                    onClick={onImageClick}
                    className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg cursor-pointer"
                    aria-label="Enlarge image"
                >
                    <ExpandIcon className="w-12 h-12 text-white" />
                </button>
            )}
        </div>
        
        {imagePreview && (
            <button
                onClick={handleUploadAreaClick}
                className="w-full mt-4 text-sm bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Change Image
            </button>
        )}
    </div>
  );
};

export default ImageUploader;