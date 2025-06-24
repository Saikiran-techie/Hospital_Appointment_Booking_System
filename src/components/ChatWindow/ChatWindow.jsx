import React, { useState, useEffect, useRef } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import {
    FaPaperPlane,
    FaPaperclip,
    FaFilePdf,
    FaWindowMinimize,
    FaWindowMaximize,
    FaTimes,
    FaFileAlt,
    FaFileImage,
    FaComments
} from 'react-icons/fa';
import './ChatWindow.css';

function ChatWindow({ appointmentId, otherPartyLabel, onClose, otherPartyName }) {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const chatEndRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentRole, setCurrentRole] = useState('User');

    useEffect(() => {
        if (!currentUser) return;

        const fetchUserRole = async () => {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const { role } = userSnap.data();
                    setCurrentRole(role || 'User');
                }
            } catch {
                setCurrentRole('User');
            }
        };

        fetchUserRole();
    }, [currentUser]);

    useEffect(() => {
        if (!appointmentId) return;

        const q = query(
            collection(db, 'chats'),
            where('appointmentId', '==', appointmentId),
            orderBy('createdAt')
        );

        const unsubscribe = onSnapshot(q, snapshot => {
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
            const fileRef = ref(storage, `chatAttachments/${appointmentId}/${Date.now()}_${uploadFile.name}`);
            await uploadBytes(fileRef, uploadFile);
            attachmentURL = await getDownloadURL(fileRef);
            attachmentType = uploadFile.type;
        }

        await addDoc(collection(db, 'chats'), {
            appointmentId,
            senderId: currentUser.uid,
            senderRole: currentRole,
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
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const getDisplayName = (msg) => {
        if (msg.senderId === currentUser.uid) return 'You';
        return currentRole === 'patient' ? `Dr. ${otherPartyName}` : otherPartyName;
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
                        {messages.length === 0 ? (
                            <div className="empty-chat d-flex flex-column align-items-center justify-content-center text-center p-4">
                                <FaComments size={40} color="#ccc" className="mb-3" />
                                <p className="text-muted mb-0">No conversation yet</p>
                                <small className="text-muted">Start your chat with {otherPartyLabel}</small>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}
                                >
                                    <div className="meta">
                                        <strong>{getDisplayName(msg)}</strong> <span>{formatTime(msg.createdAt)}</span>
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
                            ))
                        )}
                        <div ref={chatEndRef}></div>
                    </div>

                    {uploadFile && (
                        <div className="upload-preview-container">
                            <div className="upload-preview d-flex align-items-center">
                                <div className="file-info d-flex align-items-center gap-2">
                                    {uploadFile.type.startsWith('image/') && <FaFileImage className="file-icon" />}
                                    {uploadFile.type === 'application/pdf' && <FaFilePdf className="file-icon" />}
                                    {!uploadFile.type.startsWith('image/') &&
                                        uploadFile.type !== 'application/pdf' && <FaFileAlt className="file-icon" />}
                                    <span className="file-name">{uploadFile.name}</span>
                                </div>
                                <button
                                    className="remove-upload ms-auto"
                                    onClick={() => setUploadFile(null)}
                                    title="Remove"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>
                    )}

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
