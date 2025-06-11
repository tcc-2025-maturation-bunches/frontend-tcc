import { useState, useCallback, useRef } from 'react';
import { getPresignedUrl, uploadImageToS3 } from '../api/inferenceApi';

const useWebcamCapture = () => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedImageId, setUploadedImageId] = useState(null);
  const webcamRef = useRef(null);

  const requestCameraAccess = useCallback(async () => {
    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        setIsPermissionGranted(true);
      } else {
        setIsPermissionGranted(false);
        setUploadError('No camera detected');
      }
    } catch (error) {
      setIsPermissionGranted(false);
      setUploadError(`Camera access error: ${error.message}`);
    } finally {
      setIsCameraLoading(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        return imageSrc;
      }
    }
    setUploadError('Failed to capture image from webcam');
    return null;
  }, [webcamRef]);

  const resetImage = useCallback(() => {
    setCapturedImage(null);
    setUploadedImageUrl(null);
    setUploadedImageId(null);
    setUploadProgress(0);
    setUploadError(null);
    setIsUploading(false);
  }, []);

  const uploadImage = useCallback(async (userId) => {
    if (!capturedImage) {
      setUploadError('No image to upload');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const base64Data = capturedImage.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `webcam-${timestamp}.jpg`;
      
      const presignedData = await getPresignedUrl(filename, 'image/jpeg', userId);
      setUploadProgress(30);
      
      const uploadResponse = await uploadImageToS3(presignedData.upload_url, blob, 'image/jpeg');
      setUploadProgress(90);
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3');
      }
      
      const imageUrl = presignedData.upload_url.split('?')[0];
      
      setUploadedImageUrl(imageUrl);
      setUploadedImageId(presignedData.image_id);
      setUploadProgress(100);
      
      return {
        imageUrl,
        imageId: presignedData.image_id
      };
    } catch (error) {
      setUploadError(`Upload error: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [capturedImage]);

  return {
    webcamRef,
    isPermissionGranted,
    isCameraLoading,
    capturedImage,
    isUploading,
    uploadProgress,
    uploadError,
    uploadedImageUrl,
    uploadedImageId,
    requestCameraAccess,
    captureImage,
    resetImage,
    uploadImage,
  };
};

export default useWebcamCapture;
