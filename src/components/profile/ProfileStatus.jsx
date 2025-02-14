import React from 'react';

    function ProfileStatus({ isProfileActive, profileStatusText, statusBadgeClass }) {
      return (
        <div className="profile-content">
          <div className="profile-status">
            <p>
              <strong>Profile Status:</strong> <span className={statusBadgeClass}>{isProfileActive ? "Active" : "Inactive"}</span>
            </p>
            <p>{profileStatusText}</p>
          </div>
        </div>
      );
    }

    export default ProfileStatus;
