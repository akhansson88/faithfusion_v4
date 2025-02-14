import React, { useState, useRef, useEffect } from 'react';
import { useProfileData } from './hooks/useProfileData.js';
import { useImageUpload } from './hooks/useImageUpload.js';
import PersonalInformation from './PersonalInformation';
import FaithJourney from './FaithJourney';
import InterestsPreferences from './InterestsPreferences';
import ImageGallery from './ImageGallery';
import ProfileStatus from './ProfileStatus';
import InterestsSection from './InterestsSection.jsx'; // Import the new component
import { auth, storage } from '../../firebase';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

function ProfilePage() {
  const {
    fullName,
    setFullName,
    birthdate,
    setBirthdate,
    country,
    setCountry,
    occupation,
    setOccupation,
    denomination,
    setDenomination,
    churchName,
    setChurchName,
    aboutFaith,
    setAboutFaith,
    hobbies,
    setHobbies,
    favoriteVerse,
    setFavoriteVerse,
    aboutMe,
    setAboutMe,
    location,
    setLocation,
    becameChristian,
    setBecameChristian,
    baptised,
    setBaptised,
    isProfileActive,
    profileStatusText,
    statusBadgeClass,
    handleSaveProfile,
    interests,
    interestsInput,
    handleInterestsInputChange,
    handleInterestsInputKeyDown,
    removeInterest
  } = useProfileData();

  const {
    uploadedImages,
    getRootProps,
    getInputProps,
    isDragActive,
    handleDeleteImage
  } = useImageUpload();

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const profileImageRef = ref(storage, `profileImages/${user.uid}/profileImage`);
      getDownloadURL(profileImageRef)
        .then((url) => {
          setProfileImageUrl(url);
        })
        .catch((error) => {
          // If the image doesn't exist, it's fine, just don't set the URL
          if (error.code !== 'storage/object-not-found') {
            console.error("Error fetching profile image:", error);
          }
        });
    }
  }, []);

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("Please login to upload a profile image.");
      return;
    }

    const profileImageRef = ref(storage, `profileImages/${user.uid}/profileImage`);

    // Delete the previous image if it exists
    if (profileImageUrl) {
      deleteObject(profileImageRef)
        .then(() => {
          console.log("Previous profile image deleted.");
        })
        .catch((error) => {
          console.error("Error deleting previous profile image:", error);
        });
    }

    uploadBytes(profileImageRef, file)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((url) => {
            setProfileImageUrl(url);
            toast.success("Profile image updated successfully!");
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            toast.error("Failed to update profile image.");
          });
      })
      .catch((error) => {
        console.error("Error uploading profile image:", error);
        toast.error("Failed to update profile image.");
      });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header-section">
        <div className="profile-cover">
          <div className="profile-picture-wrapper" onClick={triggerFileInput}>
            <div className="profile-picture">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span className="upload-icon">+</span>
              )}
            </div>
            <button className="upload-btn">Change Photo</button>
          </div>
          <input
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleProfileImageUpload}
            ref={fileInputRef}
          />
        </div>
        <div className="profile-intro">
          <h1>Edit Profile</h1>
          <p>Make changes to your profile</p>
        </div>
      </div>

      <div className="profile-content">
        <ProfileStatus
          isProfileActive={isProfileActive}
          profileStatusText={profileStatusText}
          statusBadgeClass={statusBadgeClass}
        />

        <PersonalInformation
          fullName={fullName}
          setFullName={setFullName}
          birthdate={birthdate}
          setBirthdate={setBirthdate}
          country={country}
          setCountry={setCountry}
          occupation={occupation}
          setOccupation={setOccupation}
          location={location}
          setLocation={setLocation}
          becameChristian={becameChristian}
          setBecameChristian={setBecameChristian}
          baptised={baptised}
          setBaptised={setBaptised}
        />

        <FaithJourney
          denomination={denomination}
          setDenomination={setDenomination}
          churchName={churchName}
          setChurchName={setChurchName}
          aboutFaith={aboutFaith}
          setAboutFaith={setAboutFaith}
        />

        <InterestsPreferences
          hobbies={hobbies}
          setHobbies={setHobbies}
          favoriteVerse={favoriteVerse}
          setFavoriteVerse={setFavoriteVerse}
          aboutMe={aboutMe}
          setAboutMe={setAboutMe}
        />

        <InterestsSection
          interests={interests}
          interestsInput={interestsInput}
          handleInterestsInputChange={handleInterestsInputChange}
          handleInterestsInputKeyDown={handleInterestsInputKeyDown}
          removeInterest={removeInterest}
        />

        <ImageGallery
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          uploadedImages={uploadedImages}
          handleDeleteImage={handleDeleteImage}
        />

        <div className="profile-actions">
          <button className="button secondary-button">Cancel</button>
          <button className="button" onClick={handleSaveProfile}>Save Profile</button>
        </div>
        <Link to="/profile/details" className="button">View Profile</Link>
      </div>
    </div>
  );
}

export default ProfilePage;
