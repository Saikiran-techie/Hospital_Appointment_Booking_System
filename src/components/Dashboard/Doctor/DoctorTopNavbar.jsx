import React, { useState } from 'react';
import { Navbar, Container, Nav, Dropdown, Image } from 'react-bootstrap';
import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../Patient/PatientTopNavbar.css';

const DoctorTopNavbar = ({ userData, doctorProfile }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

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
                                {userData.name ? `Dr. ${userData.name}'s Dashboard` : 'Dashboard'}
                            </span>
                        </Navbar.Brand>

                        <Nav className="ms-auto align-items-center gap-3">
                            <Dropdown
                                align="end"
                                show={showDropdown}
                                onToggle={(isOpen) => setShowDropdown(isOpen)}
                            >
                                <Dropdown.Toggle variant="transparent" id="dropdown-profile" className="border-0 p-0">
                                    {doctorProfile.photoURL ? (
                                        <Image
                                            src={doctorProfile.photoURL}
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
                                        {doctorProfile.photoURL ? (
                                            <Image
                                                src={doctorProfile.photoURL}
                                                roundedCircle
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <FaUserCircle size={80} className="text-secondary" />
                                        )}
                                    </div>

                                    <h5 className="text-center">Dr. {userData.name}</h5>
                                    <p className="text-center">{doctorProfile.specialization}</p>
                                    <hr />
                                    <p><strong>Doctor ID:</strong> {doctorProfile.doctorCode}</p>
                                    <p><strong>Email:</strong> {userData.email}</p>
                                    <p><strong>Phone:</strong> {doctorProfile.phone}</p>
                                    <p><strong>Date Of Birth:</strong> {doctorProfile.dob}</p>
                                    <p><strong>Age:</strong> {doctorProfile.age}</p>
                                    <p><strong>Gender:</strong> {doctorProfile.gender}</p>
                                    <p><strong>Blood Group:</strong> {doctorProfile.bloodGroup}</p>
                                    <p><strong>Address:</strong> {doctorProfile.address}</p>

                                    <div className="d-flex justify-content-center">
                                        <button
                                            type="button"
                                            className="btn btn-primary mt-2"
                                            onClick={() => {
                                                setShowDropdown(false);
                                                navigate('/doctor/profile');
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

export default DoctorTopNavbar;
