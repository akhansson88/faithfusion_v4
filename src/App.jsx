import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProfilePage from './components/profile/ProfilePage';
import ProfileDetails from './components/profile/ProfileDetails'; // Import the new component
import SearchPage from './components/SearchPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import { ref, set, onDisconnect, onValue, get } from 'firebase/database';
import { rtdb, storage } from './firebase';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const lastActivity = useRef(Date.now());
  const timeoutId = useRef(null);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        resetInactivityTimeout(user);
        setUserOnlineStatus(user, true);

        // Fetch profile data
        const userRef = ref(rtdb, 'users/' + user.uid);
        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.val());
            } else {
              setProfile(null);
            }
          })
          .catch((error) => {
            console.error("Error fetching profile data:", error);
          });

        // Fetch profile image URL
        const profileImageRef = storageRef(storage, `profileImages/${user.uid}/profileImage`);
        getDownloadURL(profileImageRef)
          .then((url) => {
            setProfileImageUrl(url);
          })
          .catch((error) => {
            if (error.code !== 'storage/object-not-found') {
              console.error("Error fetching profile image:", error);
            }
            setProfileImageUrl(null);
          });

        // Fetch interests
        const interestsRef = ref(rtdb, `users/${user.uid}/interests`);
        get(interestsRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              setInterests(snapshot.val());
            } else {
              setInterests([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching interests:", error);
            setInterests([]);
          });

      } else {
        setCurrentUser(null);
        setProfile(null);
        setProfileImageUrl(null);
        setInterests([]);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId.current);
    };
  }, []);

  useEffect(() => {
    const usersRef = ref(rtdb, 'users');

    const updateOnlineUsersCount = (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        let count = 0;
        for (const userId in users) {
          if (users[userId].online) {
            count++;
          }
        }
        setOnlineUsersCount(count);
      } else {
        setOnlineUsersCount(0);
      }
    };

    // Use onValue to listen for real-time updates
    const unsubscribeOnlineUsers = onValue(usersRef, updateOnlineUsersCount);

    return () => {
      unsubscribeOnlineUsers(); // Detach the listener when the component unmounts
    };
  }, []);

  const resetInactivityTimeout = (user) => {
    clearTimeout(timeoutId.current);
    lastActivity.current = Date.now();
    timeoutId.current = setTimeout(() => {
      signOutUser(user);
    }, INACTIVITY_TIMEOUT);
  };

  const signOutUser = async (user) => {
    try {
      await setUserOnlineStatus(user, false);
      await signOut(auth);
      console.log("User logged out due to inactivity");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleActivity = () => {
    if (currentUser) {
      resetInactivityTimeout(currentUser);
      lastActivity.current = Date.now();
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [currentUser]);

  const setUserOnlineStatus = async (user, isOnline) => {
    if (user) {
      const userStatusRef = ref(rtdb, 'users/' + user.uid + '/online');
      await set(userStatusRef, isOnline);

      // Set up a disconnect listener to set the status to offline when the user disconnects
      if (isOnline) {
        onDisconnect(userStatusRef).set(false);
      }
    }
  };

  return (
    <Router>
      <AppContent
        currentUser={currentUser}
        setUserOnlineStatus={setUserOnlineStatus}
        signOutUser={signOutUser}
        onlineUsersCount={onlineUsersCount}
        profile={profile}
        profileImageUrl={profileImageUrl}
        interests={interests}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Footer />
    </Router>
  );
}

function AppContent({ currentUser, setUserOnlineStatus, signOutUser, onlineUsersCount, profile, profileImageUrl, interests }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await setUserOnlineStatus(currentUser, false);
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const RequireAuth = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="logo">FaithFusion</Link>

          {/* Hamburger Menu Icon */}
          <div className="hamburger-menu" onClick={toggleMenu}>
            <div></div>
            <div></div>
            <div></div>
          </div>

          <div className={`nav-links ${isMenuOpen ? 'show' : ''}`}>
            <Link to="/">Home</Link>
            {currentUser && <Link to="/profile/details">Profile</Link>}
            {currentUser && <Link to="/search">Search</Link>}
            <div className="online-users">
              <span className="online-dot"></span>
              {onlineUsersCount} {onlineUsersCount === 1 ? 'user' : 'users'} online
            </div>
            {currentUser ? (
              <button className="auth-button" onClick={handleLogout}>Logout</button>
            ) : (
              <Link to="/login" className="auth-button">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/profile/details" element={<RequireAuth><ProfileDetails profile={profile} profileImageUrl={profileImageUrl} interests={interests} /></RequireAuth>} />
          <Route path="/search" element={<RequireAuth><SearchPage /></RequireAuth>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
