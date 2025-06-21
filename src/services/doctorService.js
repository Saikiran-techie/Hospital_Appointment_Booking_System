
// Doctor-specific operations for managing appointments and profiles
// This service handles doctor profile retrieval and schedule updates.



import { auth, db, storage } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Get doctor profile by ID
export const getDoctorProfile = async (doctorId) => {
  const docRef = doc(db, "doctors", doctorId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};


export const getDoctorDetails = async (uid) => {
  const docRef = doc(db, 'doctors', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveDoctorDetails = async (uid, details) => {
  const docRef = doc(db, 'doctors', uid);
  await setDoc(docRef, details);
};

export const uploadProfilePhoto = async (uid, file) => {
  try {

    console.log("Uploading as user: ", auth.currentUser);

    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File too large.");
    }
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const storageRef = ref(storage, `doctorProfiles/${uid}/${cleanFileName}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};


// Update doctor's schedule
export const updateDoctorSchedule = async (doctorId, schedule) => {
  const docRef = doc(db, "doctors", doctorId);
  await updateDoc(docRef, { schedule });
};
