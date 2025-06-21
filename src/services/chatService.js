
// Send and fetch chat messages using Firebase Firestore
// This service handles sending messages to a chat and retrieving messages from a chat.

import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";

// Send message
export const sendMessage = async (chatId, message) => {
    await addDoc(collection(db, "chats", chatId, "messages"), {
        ...message,
        timestamp: new Date()
    });
};

// Get messages from a chat
export const getMessages = async (chatId) => {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
};
