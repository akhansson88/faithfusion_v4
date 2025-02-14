import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <section className="hero">
        <h1>Find Your Faithful Connection</h1>
        <p>Join thousands of Christian singles seeking meaningful relationships rooted in faith and love.</p>
        <Link to="/search" className="button">Start Your Journey</Link>
      </section>

      <div className="features">
        <div className="feature-card">
          <h3>Faith-Centered Matching</h3>
          <p>Connect with singles who share your Christian values and beliefs.</p>
        </div>
        <div className="feature-card">
          <h3>Safe Community</h3>
          <p>Join a trusted platform where genuine connections flourish.</p>
        </div>
        <div className="feature-card">
          <h3>Success Stories</h3>
          <p>Thousands of Christians have found their perfect match through FaithFusion.</p>
        </div>
      </div>

      <section className="advice-section">
        <h2>Christian Dating Guidance</h2>
        
        <div className="advice-grid">
          <div className="advice-card">
            <h3>Relationship Advice</h3>
            <ul className="advice-list">
              <li>
                <span className="advice-title">Prayer Before Dating</span>
                <p>Seek God's guidance in your relationship journey through regular prayer and meditation.</p>
              </li>
              <li>
                <span className="advice-title">Equally Yoked</span>
                <p>Understanding the importance of sharing core Christian values with your potential partner.</p>
              </li>
              <li>
                <span className="advice-title">Boundaries in Dating</span>
                <p>Setting healthy physical and emotional boundaries that honor God.</p>
              </li>
            </ul>
          </div>

          <div className="advice-card">
            <h3>Dating Tips</h3>
            <ul className="advice-list">
              <li>
                <span className="advice-title">Group Dating</span>
                <p>Start with group activities through your church or Christian community.</p>
              </li>
              <li>
                <span className="advice-title">Open Communication</span>
                <p>Discuss your faith journey and expectations early in the relationship.</p>
              </li>
              <li>
                <span className="advice-title">Spiritual Growth Together</span>
                <p>Attend church services and bible studies together to grow in faith.</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="daily-verse">
          <h3>Today's Inspiration</h3>
          <blockquote>
            "Love is patient, love is kind. It does not envy, it does not boast, it is not proud."
            <footer>- 1 Corinthians 13:4</footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
