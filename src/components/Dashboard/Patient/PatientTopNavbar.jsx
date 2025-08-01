import React, { useEffect, useState, useRef } from 'react';
import {
    Navbar, Nav, Container, Dropdown, Image, Popover, Overlay, Badge
} from 'react-bootstrap';
import {
    FaUserCircle, FaTimes, FaBell
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase/firebaseConfig';
import { getUserDetails } from '../../../services/userService';
import './PatientTopNavbar.css';

const PatientTopNavbar = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const bellRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const profileData = await getUserDetails(currentUser.uid);
                const displayName =
                    profileData?.fullName ||
                    profileData?.name ||
                    currentUser.displayName ||
                    'User';
                setUserProfile({
                    displayName,
                    email: currentUser.email,
                    profilePhoto: profileData?.photoURL || currentUser.photoURL,
                    ...profileData,
                });
            }
        };

        const fetchNotifications = async () => {
            const sample = [
                { id: 1, message: "Appointment confirmed with Dr. Sharma", time: "2 hours ago" },
                { id: 2, message: "Prescription updated by Dr. Rao", time: "Yesterday" },
                { id: 3, message: "New report uploaded for your blood test", time: "3 days ago" }
            ];
            setNotifications(sample);
        };

        fetchProfile();
        fetchNotifications();
    }, []);

    const unreadCount = notifications.length;

    return (
        <>
            <div className="main-content">
                {showDropdown && (
                    <div
                        className="navbar-blur-overlay"
                        role="button"
                        tabIndex={0}
                        onClick={() => setShowDropdown(false)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowDropdown(false)}
                    />
                )}

                <Navbar expand="lg" className="top-navbar shadow-sm">
                    <Container fluid className="d-flex justify-content-between align-items-center flex-wrap">
                        <Navbar.Brand className="fw-bold text-dark d-flex align-items-center gap-2">
                            <span className="navbar-title">
                                {userProfile?.displayName
                                    ? `${userProfile.displayName}'s Dashboard`
                                    : 'Dashboard'}
                            </span>
                        </Navbar.Brand>

                        <Nav className="ms-auto align-items-center gap-4 d-flex flex-row">
                            {/* 🔔 Notification Bell Icon */}
                            <div
                                className="position-relative notification-bell bell-animated"
                                role="button"
                                tabIndex={0}
                                ref={bellRef}
                                onClick={() => setShowNotifications(!showNotifications)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') setShowNotifications(!showNotifications);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <FaBell size={22} />
                                {unreadCount > 0 && (
                                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </div>

                            <Overlay
                                show={showNotifications}
                                target={bellRef.current}
                                placement="bottom-end"
                                containerPadding={20}
                                rootClose
                                onHide={() => setShowNotifications(false)}
                            >
                                <Popover id="notification-popover" style={{ minWidth: '320px', maxWidth: '90vw' }}>
                                    <Popover.Header as="h3"><FaBell className="me-2" /> Notifications</Popover.Header>
                                    <Popover.Body>
                                        {notifications.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {notifications.map((n) => (
                                                    <li key={n.id} className="list-group-item d-flex justify-content-between align-items-start">
                                                        <div className="ms-2 me-auto">
                                                            <div className="fw-semibold">{n.message}</div>
                                                            <small className="text-muted">{n.time}</small>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-muted text-center">No new notifications.</p>
                                        )}
                                    </Popover.Body>
                                </Popover>
                            </Overlay>

                            {/* 👤 Profile Dropdown */}
                            <Dropdown align="end" show={showDropdown} onToggle={(isOpen) => setShowDropdown(isOpen)}>
                                <Dropdown.Toggle variant="transparent" id="dropdown-profile" className="border-0 p-0">
                                    {userProfile?.profilePhoto ? (
                                        <Image
                                            src={userProfile.profilePhoto}
                                            roundedCircle
                                            style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <FaUserCircle size={42} />
                                    )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="p-3" style={{ width: '350px' }}>
                                    <span
                                        className="dropdown-close-icon"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setShowDropdown(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') setShowDropdown(false);
                                        }}
                                    >
                                        <FaTimes size={18} />
                                    </span>

                                    <div className="text-center mb-3">
                                        {userProfile?.profilePhoto ? (
                                            <Image
                                                src={userProfile.profilePhoto}
                                                roundedCircle
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <FaUserCircle size={80} className="text-secondary" />
                                        )}
                                    </div>

                                    <h5 className="text-center">{userProfile?.displayName}</h5>
                                    <p className="text-center text-muted">{userProfile?.email}</p>
                                    <hr />
                                    <p><strong>DOB:</strong> {userProfile?.dob || 'N/A'}</p>
                                    <p><strong>Age:</strong> {userProfile?.age || 'N/A'}</p>
                                    <p><strong>Gender:</strong> {userProfile?.gender || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {userProfile?.phone || 'N/A'}</p>
                                    <p><strong>Address:</strong> {userProfile?.address || 'N/A'}</p>

                                    <div className="d-flex justify-content-center">
                                        <button className="btn btn-primary mt-2" onClick={() => {
                                            setShowDropdown(false);
                                            navigate('userProfile');
                                        }}>
                                            Edit Profile
                                        </button>
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Container>
                </Navbar>
            </div>
        </>
    );
};

export default PatientTopNavbar;
