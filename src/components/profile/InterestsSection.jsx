import React from 'react';

function InterestsSection({ interests, interestsInput, handleInterestsInputChange, handleInterestsInputKeyDown, removeInterest }) {
    return (
        <div className="profile-section">
            <h2>Interests</h2>
            <div className="profile-grid">
                <div className="form-group full-width">
                    <label>Add Interests</label>
                    <input
                        type="text"
                        className="profile-input"
                        placeholder="Enter your interests separated by commas"
                        value={interestsInput}
                        onChange={handleInterestsInputChange}
                        onKeyDown={handleInterestsInputKeyDown}
                    />
                </div>
                <div className="interests-list">
                    {interests.map((interest, index) => (
                        <span key={index} className="interest-badge">
                            {interest}
                            <button className="remove-interest" onClick={() => removeInterest(interest)}>
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InterestsSection;
