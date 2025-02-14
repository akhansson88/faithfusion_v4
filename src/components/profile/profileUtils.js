import { rtdb, storage } from '../../firebase';
    import { ref, get, update } from 'firebase/database';
    import { uploadBytes, ref as storageRef, listAll, deleteObject, getDownloadURL } from 'firebase/storage';
    import { toast } from 'react-toastify';

    // Helper function to fetch profile data
    export const fetchProfileData = async (userId) => {
      const userRef = ref(rtdb, 'users/' + userId);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          console.log("No data available");
          return null;
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        throw error;
      }
    };

    // Helper function to update profile data
    export const updateProfileData = async (userId, data) => {
      const userRef = ref(rtdb, 'users/' + userId);
      try {
        await update(userRef, data);
        console.log("Profile updated successfully!");
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        throw error;
      }
    };

    // Helper function to fetch images from Firebase Storage
    export const fetchImages = async (userId) => {
      const imagesListRef = storageRef(storage, `images/${userId}`);
      try {
        const res = await listAll(imagesListRef);
        const urls = await Promise.all(res.items.map(async (itemRef) => {
          return await getDownloadURL(itemRef);
        }));
        return urls;
      } catch (error) {
        console.error("Error fetching images:", error);
        throw error;
      }
    };

    const compressImage = (file, maxWidth = 800, quality = 0.7) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((maxWidth * height) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: blob.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg', // You can change the format if needed
            quality
          );
        };

        img.onerror = (error) => reject(error);
      });
    };

    // Helper function to upload images to Firebase Storage
    export const uploadImage = async (userId, file) => {
      try {
        // Compress the image before uploading
        const compressedFile = await compressImage(file);

        if (compressedFile.size > 5000000) {
          toast.error(`Image ${file.name} is too large after compression. Please select a smaller image.`);
          return;
        }

        const imageRef = storageRef(storage, `images/${userId}/${compressedFile.name}`);
        await uploadBytes(imageRef, compressedFile);
        toast.success(`Image ${file.name} uploaded successfully!`);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(`Error uploading ${file.name}: ${error.message}`);
        throw error;
      }
    };

    // Helper function to delete images from Firebase Storage
    export const deleteImage = async (userId, imageName) => {
      const imageRef = storageRef(storage, `images/${userId}/${imageName}`);
      try {
        await deleteObject(imageRef);
        toast.success("Image deleted successfully!");
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error(`Error deleting image: ${error.message}`);
        throw error;
      }
    };
