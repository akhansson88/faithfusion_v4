import React from 'react';

    function FaithJourney({ denomination, setDenomination, churchName, setChurchName, aboutFaith, setAboutFaith }) {
      return (
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
      );
    }

    export default FaithJourney;
