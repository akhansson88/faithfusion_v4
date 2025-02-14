import React from 'react';
import { Link } from 'react-router-dom';

function ProfileDetails({ profile, profileImageUrl, interests }) {
  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-header-section">
        <div className="profile-cover">
          <div className="profile-picture-wrapper">
            <div className="profile-picture">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span>No profile image</span>
              )}
            </div>
          </div>
        </div>
        <div className="profile-intro">
          <h1>{profile.fullName}</h1>
          <p className="profile-details-bio">A faithful member of the Christian community</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-details-grid">
            <div><strong>Full Name:</strong></div><div>{profile.fullName}</div>
            <div><strong>Birthdate:</strong></div><div>{profile.birthdate}</div>
            <div><strong>Country:</strong></div><div>{profile.country}</div>
            <div><strong>Occupation:</strong></div><div>{profile.occupation}</div>
            <div><strong>Location:</strong></div><div>{profile.location}</div>
            <div><strong>Became Christian:</strong></div><div>{profile.becameChristian}</div>
            <div><strong>Baptised:</strong></div><div>{profile.baptised}</div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Faith Journey</h2>
          <div className="profile-details-grid">
            <div><strong>Denomination:</strong></div><div>{profile.denomination}</div>
            <div><strong>Church Name:</strong></div><div>{profile.churchName}</div>
            <div><strong>About Faith:</strong></div><div>{profile.aboutFaith}</div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Interests & Preferences</h2>
          <div className="profile-details-grid">
            <div><strong>Hobbies:</strong></div><div>{profile.hobbies}</div>
            <div><strong>Favorite Verse:</strong></div><div>{profile.favoriteVerse}</div>
            <div><strong>About Me:</strong></div><div>{profile.aboutMe}</div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Interests</h2>
          <div className="interests-list">
            {interests && interests.map((interest, index) => (
              <span key={index} className="interest-badge">
                {interest}
              </span>
            ))}
          </div>
        </div>
        <Link to="/profile" className="button">Edit Profile</Link>
      </div>
    </div>
  );
}

export default ProfileDetails;
