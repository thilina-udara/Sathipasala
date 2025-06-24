import React, { useState } from 'react';
import axios from 'axios';

const CloudinaryUpload = ({ 
  uploadType = 'learning-image', // 'student-photo', 'learning-image' or 'learning-document'
  onUploadSuccess,
  onUploadError,
  acceptedTypes = 'image/*',
  maxSize = 5, // MB
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError?.(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to /${uploadType}`);

      const response = await axios.post(
        `/api/upload/${uploadType}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.success) {
        // Check if we have valid upload data
        const uploadData = response.data.data;
        
        // Ensure we have a URL (either from secure_url, path, or worst case, construct it)
        if (!uploadData.url && uploadData.path) {
          uploadData.url = uploadData.path;
        }
        
        // Ensure we have a public_id
        if (!uploadData.public_id && uploadData.filename) {
          // Try to extract public_id from filename or path
          if (uploadData.filename.includes('/')) {
            uploadData.public_id = uploadData.filename.split('/').pop();
          } else {
            uploadData.public_id = uploadData.filename;
          }
        }
        
        console.log('Processed upload data:', uploadData);
        
        // Only call success if we have at least a URL
        if (uploadData.url) {
          onUploadSuccess?.(uploadData);
        } else {
          throw new Error('Missing image URL in upload response');
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={`upload-component ${className}`}>
      <input
        type="file"
        accept={acceptedTypes}
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={uploading}
        className="hidden"
        id={`upload-${uploadType}`}
      />
      
      <label
        htmlFor={`upload-${uploadType}`}
        className={`
          inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm 
          text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading... {uploadProgress}%
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload {uploadType === 'learning-document' ? 'Document' : 'Image'}
          </>
        )}
      </label>
    </div>
  );
};

export default CloudinaryUpload;