import { useState, useCallback, useEffect } from 'react';
import { auth } from '../../../firebase';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { fetchImages, uploadImage, deleteImage } from '../profileUtils';

export const useImageUpload = () => {
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchImages(user.uid)
        .then(urls => {
          setUploadedImages(urls);
        })
        .catch(error => {
          console.error("Error fetching images:", error);
        });
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please login to upload images.");
      return;
    }

    if (uploadedImages.length + acceptedFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    for (const file of acceptedFiles) {
      if (file.size > 5000000) {
        toast.error(`Image ${file.name} is too large. Please select an image smaller than 5MB.`);
        return;
      }
      try {
        await uploadImage(user.uid, file);
        // Refresh images
        const urls = await fetchImages(user.uid);
        setUploadedImages(urls);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  }, [uploadedImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  const handleDeleteImage = async (url) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please login to delete images.");
      return;
    }

    try {
      // Decode the URL to handle special characters
      const decodedUrl = decodeURIComponent(url);

      // Remove query parameters from the URL
      const baseUrl = decodedUrl.split('?')[0];

      // Extract the filename from the base URL
      const imageName = baseUrl.substring(baseUrl.lastIndexOf('/') + 1);

      await deleteImage(user.uid, imageName);
      // Refresh images
      const urls = await fetchImages(user.uid);
      setUploadedImages(urls);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return {
    uploadedImages,
    getRootProps,
    getInputProps,
    isDragActive,
    handleDeleteImage
  };
};
