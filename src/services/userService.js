import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Fetch user profile details
export const getUserDetails = async (uid) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
};

// Check if user profile exists
export const checkUserExists = async (uid) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    }
};

// Save or update user profile details
export const saveUserDetails = async (uid, userDetails) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            await updateDoc(userDocRef, userDetails);
        } else {
            await setDoc(userDocRef, userDetails);
        }
    } catch (error) {
        console.error('Error saving/updating user details:', error);
        throw error;
    }
};

// ✅ Upload user profile photo and return download URL
export const uploadProfilePhoto = async (uid, file) => {
    try {
        if (!uid || !file) {
            throw new Error("Missing UID or file for upload.");
        }

        // Upload to 'profilePhotos/{uid}'
        const storageRef = ref(storage, `profilePhotos/${uid}`);
        await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw error;
    }
};

// ✅ Save profile photo URL in Firestore user document
export const saveProfilePhotoUrl = async (uid, photoUrl) => {
    try {
        if (!uid || !photoUrl) {
            throw new Error("Missing UID or photo URL.");
        }

        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            photoURL: photoUrl  // 🔄 standardizing to 'photoURL' as used in your profile form
        });
    } catch (error) {
        console.error('Error saving profile photo URL:', error);
        throw error;
    }
};
