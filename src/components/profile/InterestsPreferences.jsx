import React from 'react';

    function InterestsPreferences({ hobbies, setHobbies, favoriteVerse, setFavoriteVerse, aboutMe, setAboutMe }) {
      return (
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
      );
    }

    export default InterestsPreferences;
