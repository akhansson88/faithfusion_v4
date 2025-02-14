import React, { useState, useEffect } from 'react';
import { ref, get, onValue } from 'firebase/database';
import { rtdb, storage } from '../firebase';
import { getDownloadURL, ref as storageRef, listAll } from 'firebase/storage';

function SearchPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [profileImages, setProfileImages] = useState({});
  const [interests, setInterests] = useState({});
  const [galleryImages, setGalleryImages] = useState({});

  useEffect(() => {
    const fetchActiveProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersRef = ref(rtdb, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const users = snapshot.val();
          // Filter out inactive profiles
          const activeProfiles = Object.entries(users)
            .filter(([, user]) => user.isProfileActive)
            .map(([uid, user]) => ({ uid, ...user }));
          setProfiles(activeProfiles);
        } else {
          setProfiles([]);
        }
      } catch (e) {
        setError(e);
        console.error("Error fetching profiles:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveProfiles();
  }, []);

  useEffect(() => {
    // Fetch online statuses for all active profiles
    const fetchOnlineStatuses = () => {
      const statuses = {};
      profiles.forEach(profile => {
        const userStatusRef = ref(rtdb, `users/${profile.uid}/online`);
        onValue(userStatusRef, (snapshot) => {
          statuses[profile.uid] = snapshot.val() || false;
          setOnlineStatuses(prevStatuses => ({ ...prevStatuses, [profile.uid]: snapshot.val() || false }));
        });
      });
    };

    if (profiles.length > 0) {
      fetchOnlineStatuses();
    }

    return () => {
      // Clean up listeners (if needed) - Firebase handles this automatically
    };
  }, [profiles]);

  useEffect(() => {
    // Fetch profile and gallery images for all active profiles
    const fetchImages = async () => {
      const profileImagesData = {};
      const galleryImagesData = {};

      for (const profile of profiles) {
        try {
          const profileImageRef = storageRef(storage, `profileImages/${profile.uid}/profileImage`);
          const profileImageUrl = await getDownloadURL(profileImageRef);
          profileImagesData[profile.uid] = profileImageUrl;
        } catch (error) {
          // If the image doesn't exist, it's fine, just don't set the URL
          if (error.code !== 'storage/object-not-found') {
            console.error(`Error fetching profile image for ${profile.uid}:`, error);
          }
          profileImagesData[profile.uid] = null; // Set to null if no image
        }

        try {
          const galleryListRef = storageRef(storage, `images/${profile.uid}`);
          const res = await listAll(galleryListRef);
          const urls = await Promise.all(res.items.map(async (itemRef) => {
            return await getDownloadURL(itemRef);
          }));
          galleryImagesData[profile.uid] = urls;
        } catch (error) {
          console.error(`Error fetching gallery images for ${profile.uid}:`, error);
          galleryImagesData[profile.uid] = [];
        }
      }
      setProfileImages(profileImagesData);
      setGalleryImages(galleryImagesData);
    };

    if (profiles.length > 0) {
      fetchImages();
    }
  }, [profiles]);

  useEffect(() => {
    // Fetch interests for all active profiles
    const fetchInterests = async () => {
      const interestsData = {};
      for (const profile of profiles) {
        try {
          const interestsRef = ref(rtdb, `users/${profile.uid}/interests`);
          const snapshot = await get(interestsRef);
          if (snapshot.exists()) {
            interestsData[profile.uid] = snapshot.val();
          } else {
            interestsData[profile.uid] = [];
          }
        } catch (error) {
          console.error(`Error fetching interests for ${profile.uid}:`, error);
          interestsData[profile.uid] = [];
        }
      }
      setInterests(interestsData);
    };

    if (profiles.length > 0) {
      fetchInterests();
    }
  }, [profiles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="search-wrapper">
      <div className="search-header">
        <h1>Find Your Match</h1>
        <p>Connect with other Christians who share your values and beliefs</p>
      </div>

      <div className="search-container">
        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, location, or interests..."
              className="search-input"
            />
            <button className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <div className="filter-groups">
            <div className="filter-group">
              <label>Age Range</label>
              <div className="range-inputs">
                <input type="number" placeholder="Min" className="filter-input" min="18" max="100" />
                <span>to</span>
                <input type="number" placeholder="Max" className="filter-input" min="18" max="100" />
              </div>
            </div>

            <div className="filter-group">
              <label>Denomination</label>
              <select className="filter-input">
                <option value="">All Denominations</option>
                <option value="catholic">Catholic</option>
                <option value="protestant">Protestant</option>
                <option value="orthodox">Orthodox</option>
                <option value="evangelical">Evangelical</option>
                <option value="baptist">Baptist</option>
                <option value="methodist">Methodist</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input type="text" placeholder="City or Country" className="filter-input" />
            </div>
          </div>
        </div>

        <div className="search-results-info">
          <p>Showing {profiles.length} matches</p>
          <select className="sort-select">
            <option value="relevant">Most Relevant</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div className="search-results">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.uid}
              profile={profile}
              profileImages={profileImages}
              galleryImages={galleryImages}
              onlineStatuses={onlineStatuses}
              interests={interests}
            />
          ))}
        </div>

        <div className="pagination">
          <button className="pagination-btn">&lt;</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <span>...</span>
          <button className="pagination-btn">12</button>
          <button className="pagination-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ profile, profileImages, galleryImages, onlineStatuses, interests }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages[profile.uid].length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === galleryImages[profile.uid].length - 1 ? 0 : prevIndex + 1
    );
  };

  const hasGalleryImages = galleryImages[profile.uid] && galleryImages[profile.uid].length > 0;
  const currentImage = hasGalleryImages ? galleryImages[profile.uid][currentImageIndex] : profileImages[profile.uid];

  // Calculate age
  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = profile.birthdate ? calculateAge(profile.birthdate) : null;

  return (
    <div className="profile-result-card">
      <div className="profile-result-image">
        <div className="online-status">
          <span className={`online-status-indicator ${onlineStatuses[profile.uid] ? 'online' : 'offline'}`}></span>
          <span className="online-status-text">{onlineStatuses[profile.uid] ? 'Online' : 'Offline'}</span>
        </div>
        {hasGalleryImages && (
          <>
            <button className="image-slider-button prev" onClick={handlePrevImage}>
              &lt;
            </button>
            <button className="image-slider-button next" onClick={handleNextImage}>
              &gt;
            </button>
          </>
        )}
        {currentImage ? (
          <img src={currentImage} alt="Profile" />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>
      <div className="profile-result-content">
        <div className="profile-name-with-image">
          {profileImages[profile.uid] && (
            <img
              src={profileImages[profile.uid]}
              alt="Profile"
              className="profile-match-image"
            />
          )}
          <h3>{profile.fullName}, {age !== null ? age : 'Unknown Age'}</h3>
        </div>
        <div className="profile-result-details">
          <span className="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {profile.location || 'Unknown'}
          </span>
          <span className="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
            {profile.denomination || 'Unknown'}
          </span>
          {/* Age calculation can be added here if birthdate is available */}
        </div>
        <p className="profile-result-bio">
          {profile.aboutMe || 'No bio provided.'}
        </p>
        <div className="profile-result-interests">
          {interests[profile.uid] &&
            interests[profile.uid].slice(0, 5).map((interest, index) => (
              <span key={index}>{interest}</span>
            ))}
          {interests[profile.uid] && interests[profile.uid].length > 5 && (
            <span>+{interests[profile.uid].length - 5} more</span>
          )}
        </div>
        <button className="button view-profile-btn">View Profile</button>
      </div>
    </div>
  );
}

export default SearchPage;
