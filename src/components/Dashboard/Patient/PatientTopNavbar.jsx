import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Dropdown, Image } from 'react-bootstrap';
import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase/firebaseConfig';
import { getUserDetails } from '../../../services/userService';
import './PatientTopNavbar.css';

const PatientTopNavbar = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

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
                    displayName: displayName,
                    email: currentUser.email,
                    profilePhoto: profileData?.photoURL || currentUser.photoURL,
                    ...profileData,
                });
            }
        };
        fetchProfile();
    }, []);

    return (
        <>
            <div className="main-content">
                {showDropdown && (
                    <div
                        className="navbar-blur-overlay"
                        role="button"
                        tabIndex={0}
                        onClick={() => setShowDropdown(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setShowDropdown(false);
                            }
                        }}
                    ></div>
                )}

                <Navbar expand="lg" className="top-navbar shadow-sm">
                    <Container fluid>
                        <Navbar.Brand className="fw-bold text-dark d-flex align-items-center gap-2">
                            <span className="navbar-title">
                                {userProfile?.displayName
                                    ? `${userProfile.displayName}'s Dashboard`
                                    : 'Dashboard'}
                            </span>
                        </Navbar.Brand>

                        <Nav className="ms-auto align-items-center gap-3">
                            <Dropdown
                                align="end"
                                show={showDropdown}
                                onToggle={(isOpen) => setShowDropdown(isOpen)}
                            >
                                <Dropdown.Toggle
                                    variant="transparent"
                                    id="dropdown-profile"
                                    className="border-0 p-0"
                                >
                                    {userProfile?.profilePhoto ? (
                                        <Image
                                            src={userProfile.profilePhoto}
                                            roundedCircle
                                            style={{
                                                width: '42px',
                                                height: '42px',
                                                objectFit: 'cover',
                                            }}
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
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                }}
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
                                        <button
                                            className="btn btn-primary mt-2"
                                            onClick={() => {
                                                setShowDropdown(false);
                                                navigate('userProfile');
                                            }}
                                        >
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
