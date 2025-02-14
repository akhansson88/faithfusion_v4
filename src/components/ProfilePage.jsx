import React, { useState, useEffect, useCallback } from 'react';
    import { auth, rtdb, storage } from '../firebase';
    import { ref, get, update } from 'firebase/database';
    import { uploadBytes, ref as storageRef, listAll, deleteObject, getDownloadURL } from 'firebase/storage';
    import countries from '../data/countries';
    import { toast } from 'react-toastify';
    import { useDropzone } from 'react-dropzone';

    // Helper function to fetch profile data
    const fetchProfileData = async (userId) => {
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
    const updateProfileData = async (userId, data) => {
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
    const fetchImages = async (userId) => {
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
    const uploadImage = async (userId, file) => {
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
    const deleteImage = async (userId, imageName) => {
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

    function ProfilePage() {
      const [fullName, setFullName] = useState('');
      const [birthdate, setBirthdate] = useState('');
      const [country, setCountry] = useState('');
      const [occupation, setOccupation] = useState('');
      const [denomination, setDenomination] = useState('');
      const [churchName, setChurchName] = useState('');
      const [aboutFaith, setAboutFaith] = useState('');
      const [hobbies, setHobbies] = useState('');
      const [favoriteVerse, setFavoriteVerse] = useState('');
      const [aboutMe, setAboutMe] = useState('');
      const [location, setLocation] = useState('');
      const [becameChristian, setBecameChristian] = useState('');
      const [baptised, setBaptised] = useState('');
      const [isProfileActive, setIsProfileActive] = useState(false);
      const [uploadedImages, setUploadedImages] = useState([]);

      useEffect(() => {
        const user = auth.currentUser;
        if (user) {
          // Fetch profile data
          fetchProfileData(user.uid)
            .then(data => {
              if (data) {
                setFullName(data.fullName || '');
                setBirthdate(data.birthdate || '');
                setCountry(data.country || '');
                setOccupation(data.occupation || '');
                setDenomination(data.denomination || '');
                setChurchName(data.churchName || '');
                setAboutFaith(data.aboutFaith || '');
                setHobbies(data.hobbies || '');
                setFavoriteVerse(data.favoriteVerse || '');
                setAboutMe(data.aboutMe || '');
                setLocation(data.location || '');
                setBecameChristian(data.becameChristian || '');
                setBaptised(data.baptised || '');
                setIsProfileActive(data.isProfileActive || false);
              }
            })
            .catch(error => {
              console.error("Error fetching profile data:", error);
            });

          // Fetch images
          fetchImages(user.uid)
            .then(urls => {
              setUploadedImages(urls);
            })
            .catch(error => {
              console.error("Error fetching images:", error);
            });
        }
      }, []);

      const handleSaveProfile = async () => {
        const user = auth.currentUser;
        if (user) {
          const isFormComplete =
            fullName &&
            birthdate &&
            country &&
            occupation &&
            denomination &&
            churchName &&
            aboutFaith &&
            hobbies &&
            favoriteVerse &&
            aboutMe &&
            location &&
            becameChristian &&
            baptised;

          const data = {
            fullName: fullName,
            birthdate: birthdate,
            country: country,
            occupation: occupation,
            denomination: denomination,
            churchName: churchName,
            aboutFaith: aboutFaith,
            hobbies: hobbies,
            favoriteVerse: favoriteVerse,
            aboutMe: aboutMe,
            location: location,
            becameChristian: becameChristian,
            baptised: baptised,
            isProfileActive: isFormComplete
          };

          updateProfileData(user.uid, data)
            .then(() => {
              setIsProfileActive(isFormComplete);
            })
            .catch(error => {
              console.error("Error updating profile:", error);
            });
        }
      };

      const profileStatusText = isProfileActive
        ? "Your profile is active and visible to other users."
        : "Your profile is inactive. To activate your profile, please fill in all required fields and save your profile.";

      const statusBadgeClass = isProfileActive ? "profile-badge active" : "profile-badge inactive";

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

      return (
        <div className="profile-wrapper">
          <div className="profile-header-section">
            <div className="profile-cover">
              <div className="profile-picture-wrapper">
                <div className="profile-picture">
                  <span className="upload-icon">+</span>
                </div>
                <button className="upload-btn">Change Photo</button>
              </div>
            </div>
            <div className="profile-intro">
              <h1>Your Profile</h1>
              <p>Complete your profile to connect with other Christians</p>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-status">
              <p>
                <strong>Profile Status:</strong> <span className={statusBadgeClass}>{isProfileActive ? "Active" : "Inactive"}</span>
              </p>
              <p>{profileStatusText}</p>
            </div>

            <div className="profile-section">
              <h2>Personal Information</h2>
              <div className="profile-grid">
                <div className="form-group">
                  <label>Full Name <span className="required-star">*</span></label>
                  <input type="text" className="profile-input" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Birthdate <span className="required-star">*</span></label>
                  <input type="date" className="profile-input" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Country <span className="required-star">*</span></label>
                  <select
                    className="profile-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Occupation <span className="required-star">*</span></label>
                  <input type="text" className="profile-input" placeholder="Your occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Location (City or Town) <span className="required-star">*</span></label>
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="Your city or town"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Became Christian <span className="required-star">*</span></label>
                  <input
                    type="date"
                    className="profile-input"
                    value={becameChristian}
                    onChange={(e) => setBecameChristian(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Baptised <span className="required-star">*</span></label>
                  <select
                    className="profile-input"
                    value={baptised}
                    onChange={(e) => setBaptised(e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Faith Journey</h2>
              <div className="profile-grid">
                <div className="form-group">
                  <label>Denomination <span className="required-star">*</span></label>
                  <select className="profile-input" value={denomination} onChange={(e) => setDenomination(e.target.value)} required>
                    <option value="">Select denomination</option>
                    <option value="catholic">Catholic</option>
                    <option value="protestant">Protestant</option>
                    <option value="orthodox">Orthodox</option>
                    <option value="evangelical">Evangelical</option>
                    <option value="baptist">Baptist</option>
                    <option value="methodist">Methodist</option>
                    <option value="lutheran">Lutheran</option>
                    <option value="presbyterian">Presbyterian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Church Name <span className="required-star">*</span></label>
                  <input type="text" className="profile-input" placeholder="Your church name" value={churchName} onChange={(e) => setChurchName(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label>About Your Faith <span className="required-star">*</span></label>
                  <textarea
                    className="profile-input"
                    rows="4"
                    placeholder="Share your faith journey and what your relationship with God means to you..."
                    value={aboutFaith}
                    onChange={(e) => setAboutFaith(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Interests & Preferences</h2>
              <div className="profile-grid">
                <div className="form-group">
                  <label>Hobbies <span className="required-star">*</span></label>
                  <input type="text" className="profile-input" placeholder="Your hobbies" value={hobbies} onChange={(e) => setHobbies(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Favorite Bible Verse <span className="required-star">*</span></label>
                  <input type="text" className="profile-input" placeholder="Your favorite verse" value={favoriteVerse} onChange={(e) => setFavoriteVerse(e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label>About Me <span className="required-star">*</span></label>
                  <textarea
                    className="profile-input"
                    rows="4"
                    placeholder="Tell others about yourself, your interests, and what you're looking for..."
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Profile Images</h2>
              <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the images here ...</p>
                ) : (
                  <p>Drag 'n' drop some images here, or click to select images (Max 5 images)</p>
                )}
              </div>
              <div className="image-preview">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="image-container">
                    <img src={url} alt={`Uploaded image ${index + 1}`} />
                    <button className="delete-image-button" onClick={() => handleDeleteImage(url)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-actions">
              <button className="button secondary-button">Cancel</button>
              <button className="button" onClick={handleSaveProfile}>Save Profile</button>
            </div>
          </div>
        </div>
      );
    }

    export default ProfilePage;
