import React from 'react';
    import countries from '../../data/countries';

    function PersonalInformation({
      fullName,
      setFullName,
      birthdate,
      setBirthdate,
      country,
      setCountry,
      occupation,
      setOccupation,
      location,
      setLocation,
      becameChristian,
      setBecameChristian,
      baptised,
      setBaptised,
    }) {
      return (
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
      );
    }

    export default PersonalInformation;
