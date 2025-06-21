import React, { useState, useEffect, useRef } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { FaPaperPlane, FaPaperclip, FaFilePdf, FaWindowMinimize, FaWindowMaximize, FaTimes } from 'react-icons/fa';
import './ChatWindow.css';

function ChatWindow({ appointmentId, otherPartyLabel = 'Doctor', onClose }) {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const chatEndRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (!appointmentId) return;

        const q = query(
            collection(db, 'chats'),
            where('appointmentId', '==', appointmentId),
            orderBy('createdAt')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(chats);
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => unsubscribe();
    }, [appointmentId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !uploadFile) return;

        let attachmentURL = '';
        let attachmentType = '';

        if (uploadFile) {
            const fileRef = ref(storage, `chatAttachments/${appointmentId}/${uploadFile.name}`);
            await uploadBytes(fileRef, uploadFile);
            attachmentURL = await getDownloadURL(fileRef);
            attachmentType = uploadFile.type;
        }

        await addDoc(collection(db, 'chats'), {
            appointmentId,
            senderId: currentUser.uid,
            senderRole: currentUser.role || 'unknown',
            messageText: newMessage,
            attachmentURL,
            attachmentType,
            createdAt: serverTimestamp()
        });

        setNewMessage('');
        setUploadFile(null);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
            <div className="chat-header">
                Chat with {otherPartyLabel}
                <div className="controls">
                    {isMinimized ? (
                        <button title="Maximize" onClick={() => setIsMinimized(false)}>
                            <FaWindowMaximize />
                        </button>
                    ) : (
                        <button title="Minimize" onClick={() => setIsMinimized(true)}>
                            <FaWindowMinimize />
                        </button>
                    )}
                    <button title="Close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}
                            >
                                <div className="meta">
                                    <strong>{msg.senderRole}</strong> <span>{formatTime(msg.createdAt)}</span>
                                </div>

                                {msg.messageText && <div className="text">{msg.messageText}</div>}

                                {msg.attachmentURL && (
                                    <div className="attachment">
                                        {msg.attachmentType.startsWith('image/') && (
                                            <img src={msg.attachmentURL} alt="attachment" />
                                        )}

                                        {msg.attachmentType === 'application/pdf' && (
                                            <a href={msg.attachmentURL} target="_blank" rel="noreferrer">
                                                <FaFilePdf /> View PDF
                                            </a>
                                        )}

                                        {msg.attachmentType.startsWith('audio/') && (
                                            <audio controls src={msg.attachmentURL}>
                                                <track kind="captions" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef}></div>
                    </div>

                    <div className="chat-input">
                        <label htmlFor="file-upload">
                            <FaPaperclip className="attach-icon" />
                        </label>
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                        <input
                            type="text"
                            placeholder="Type message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendMessage();
                            }}
                        />
                        <button onClick={handleSendMessage}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatWindow;
