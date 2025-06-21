// firestoreService.js

import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Save general user data to 'users' collection
export const saveUserData = async (uid, name, email, role, provider) => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            name,
            email,
            role: role.toLowerCase(),
            provider,
            createdAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
};

// Save role-specific user data (to 'patients' or 'doctors' collection)
export const saveRoleSpecificData = async (uid, name, email, role) => {
    try {
        const validRole = role.toLowerCase();
        if (!['patient', 'doctor'].includes(validRole)) {
            console.log(`No role-specific collection for role: ${validRole}`);
            return;
        }

        const roleCollection = `${validRole}s`;
        const roleRef = doc(db, roleCollection, uid);

        await setDoc(roleRef, {
            uid,
            name,
            email,
            status: 'active',
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving role-specific data:', error);
        throw error;
    }
};

// Fetch user document from 'users' collection
export const getUserData = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        return await getDoc(userRef);
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

// Fetch data from 'patients' or 'doctors' collection
export const getRoleSpecificData = async (uid, role) => {
    try {
        const validRole = role.toLowerCase();
        if (!['patient', 'doctor'].includes(validRole)) {
            throw new Error('Invalid role');
        }

        const roleRef = doc(db, `${validRole}s`, uid);
        return await getDoc(roleRef);
    } catch (error) {
        console.error('Error fetching role-specific data:', error);
        throw error;
    }
};
