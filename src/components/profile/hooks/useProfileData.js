import { useState, useEffect } from 'react';
import { auth, rtdb } from '../../../firebase';
import { fetchProfileData, updateProfileData } from '../profileUtils';
import { ref, get, set } from 'firebase/database';
import { toast } from 'react-toastify';

export const useProfileData = () => {
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [country, setCountry] = useState('');
  const [occupation, setOccupation] = useState('');
  const [denomination, setDenomination] = useState('');
  const [churchName, setChurchName] = useState('');
  const [aboutFaith, setAboutFaith] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [favoriteVerse, setFavoriteVerse] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [location, setLocation] = useState('');
  const [becameChristian, setBecameChristian] = useState('');
  const [baptised, setBaptised] = useState('');
  const [isProfileActive, setIsProfileActive] = useState(false);
  const [interestsInput, setInterestsInput] = useState('');
  const [interests, setInterests] = useState([]);
  const MAX_INTERESTS = 20;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchProfileData(user.uid)
        .then(data => {
          if (data) {
            setFullName(data.fullName || '');
            setBirthdate(data.birthdate || '');
            setCountry(data.country || '');
            setOccupation(data.occupation || '');
            setDenomination(data.denomination || '');
            setChurchName(data.churchName || '');
            setAboutFaith(data.aboutFaith || '');
            setHobbies(data.hobbies || '');
            setFavoriteVerse(data.favoriteVerse || '');
            setAboutMe(data.aboutMe || '');
            setLocation(data.location || '');
            setBecameChristian(data.becameChristian || '');
            setBaptised(data.baptised || '');
            setIsProfileActive(data.isProfileActive || false);
          }
        })
        .catch(error => {
          console.error("Error fetching profile data:", error);
        });

      // Fetch interests from Firebase
      const interestsRef = ref(rtdb, `users/${user.uid}/interests`);
      get(interestsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setInterests(snapshot.val());
          }
        })
        .catch((error) => {
          console.error("Error fetching interests:", error);
        });
    }
  }, []);

    const handleInterestsInputChange = (e) => {
    setInterestsInput(e.target.value);
  };

  const handleInterestsInputKeyDown = (e) => {
    if (e.key === ',') {
      e.preventDefault();
      const interest = interestsInput.trim();
      if (interest && !interests.includes(interest)) {
        if (interests.length < MAX_INTERESTS) {
          const updatedInterests = [...interests, interest];
          setInterests(updatedInterests);
          saveInterestsToFirebase(updatedInterests);
        } else {
          toast.error(`You can only have a maximum of ${MAX_INTERESTS} interests.`);
        }
      }
      setInterestsInput('');
    }
  };

  const removeInterest = (interestToRemove) => {
    const updatedInterests = interests.filter((interest) => interest !== interestToRemove);
    setInterests(updatedInterests);
    saveInterestsToFirebase(updatedInterests);
  };

  const saveInterestsToFirebase = (interests) => {
    const user = auth.currentUser;
    if (user) {
      const interestsRef = ref(rtdb, `users/${user.uid}/interests`);
      set(interestsRef, interests)
        .then(() => {
          console.log("Interests saved to Firebase");
        })
        .catch((error) => {
          console.error("Error saving interests:", error);
        });
    }
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const isFormComplete =
        fullName &&
        birthdate &&
        country &&
        occupation &&
        denomination &&
        churchName &&
        aboutFaith &&
        hobbies &&
        favoriteVerse &&
        aboutMe &&
        location &&
        becameChristian &&
        baptised;

      const data = {
        fullName: fullName,
        birthdate: birthdate,
        country: country,
        occupation: occupation,
        denomination: denomination,
        churchName: churchName,
        aboutFaith: aboutFaith,
        hobbies: hobbies,
        favoriteVerse: favoriteVerse,
        aboutMe: aboutMe,
        location: location,
        becameChristian: becameChristian,
        baptised: baptised,
        isProfileActive: isFormComplete
      };

      // Save interests to Firebase
      saveInterestsToFirebase(interests);

      // Update profile data
      updateProfileData(user.uid, data)
        .then(() => {
          setIsProfileActive(isFormComplete);
        })
        .catch(error => {
          console.error("Error updating profile:", error);
        });
    }
  };

  const profileStatusText = isProfileActive
    ? "Your profile is active and visible to other users."
    : "Your profile is inactive. To activate your profile, please fill in all required fields and save your profile.";

  const statusBadgeClass = isProfileActive ? "profile-badge active" : "profile-badge inactive";

  return {
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
    interestsInput,
    interests,
    handleInterestsInputChange,
    handleInterestsInputKeyDown,
    removeInterest
  };
};
