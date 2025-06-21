// authService.js

import { auth, googleProvider } from '../firebase/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';

import {
    saveUserData,
    saveRoleSpecificData
} from './firestoreService';

// Register new user with email & password
export const registerWithEmailPassword = async (name, email, password, role) => {
    try {
        if (!name || !email || !password || !role) {
            throw new Error('All fields are required.');
        }

        const validRole = role.toLowerCase();
        if (!['patient', 'doctor'].includes(validRole)) {
            throw new Error('Invalid role.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await saveUserData(user.uid, name, email, validRole, 'email-password');
        await saveRoleSpecificData(user.uid, name, email, validRole);

        return userCredential;
    } catch (error) {
        console.error('Registration Error:', error);
        throw error;
    }
};

// Login user with email & password
export const loginWithEmailPassword = async (email, password) => {
    try {
        if (!email || !password) {
            throw new Error('Email and Password are required.');
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
};

// Google Sign-In (only popup, rest handled in signup page)
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        return { user };
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
};

// Password reset via email
export const resetPassword = async (email) => {
    try {
        if (!email) {
            throw new Error('Email is required.');
        }
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Password Reset Error:', error);
        throw error;
    }
};

// Logout user
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout Error:', error);
        throw error;
    }
};

// Set Firebase Auth persistence based on Remember Me option
export const setAuthPersistence = async (rememberMe) => {
    try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    } catch (error) {
        console.error('Persistence Setting Error:', error);
        throw error;
    }
};
