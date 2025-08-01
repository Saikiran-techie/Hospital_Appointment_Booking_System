// ✅ Updated PatientSidebar.jsx with Help & Support
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
    FaHome, FaCalendarAlt, FaNotesMedical, FaFileMedical,
    FaPills, FaUser, FaBars, FaTimes, FaSignOutAlt, FaQuestionCircle
} from 'react-icons/fa';
import './PatientSidebar.css';
import logoImg from '../../../assets/brand-logo.png';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase/firebaseConfig';

const PatientSidebar = ({ isOpen, toggleSidebar }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
            if (window.innerWidth >= 992) toggleSidebar(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [toggleSidebar]);

    const handleLargeSidebarNavClick = () => {
        if (isMobile) toggleSidebar(false);
    };

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                navigate('/');
            })
            .catch((error) => {
                console.error('Logout Error:', error);
            });
    };

    return (
        <>
            {/* Mini Sidebar */}
            {isMobile && !isOpen && (
                <div className="mini-sidebar">
                    <button className="mini-sidebar-toggle" onClick={() => toggleSidebar(true)}>
                        <FaBars />
                    </button>
                    <div className="mini-sidebar-icons">
                        <NavLink to="dashboard" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaHome /></NavLink>
                        <NavLink to="bookAppointment" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaCalendarAlt /></NavLink>
                        <NavLink to="myAppointments" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaNotesMedical /></NavLink>
                        <NavLink to="medical-reports" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaFileMedical /></NavLink>
                        <NavLink to="prescriptions" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaPills /></NavLink>
                        <NavLink to="payment-history" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaFileMedical /></NavLink>
                        <NavLink to="userprofile" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaUser /></NavLink>
                        <NavLink to="helpsupport" className={({ isActive }) => `nav-icon ${isActive ? "active-icon" : ""}`}><FaQuestionCircle /></NavLink>
                    </div>
                    <div className="mini-sidebar-icons mt-auto">
                        <button className="logout-icon-modern" onClick={handleLogout} title="Logout">
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            )}

            {/* Large Sidebar */}
            <div className={`sidebar ${isMobile ? (isOpen ? 'open' : 'closed') : 'desktop'}`}>
                <div className="sidebar-header">
                    <img src={logoImg} alt="Hospital Logo" />
                    <span>MediConnect Hospital</span>
                    {isMobile && (
                        <button className="close-sidebar-btn" onClick={() => toggleSidebar(false)}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="d-flex flex-column justify-content-center gap-3">
                    <Nav className="flex-column sidebar-nav">
                        <NavLink to="dashboard" end onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaHome /> Dashboard</NavLink>
                        <NavLink to="bookAppointment" onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaCalendarAlt /> Book Appointment</NavLink>
                        <NavLink to="myAppointments" onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaNotesMedical /> My Appointments</NavLink>
                        <NavLink to="medical-reports" onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaFileMedical /> Medical Reports</NavLink>
                        <NavLink to="prescriptions" onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaPills /> Prescriptions</NavLink>
                        <NavLink to="payment-history" onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaFileMedical /> Payment History</NavLink>
                        <NavLink to="userprofile" onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaUser /> Profile</NavLink>
                        <NavLink to="helpsupport" onClick={handleLargeSidebarNavClick} className={({ isActive }) => `nav-link ${isActive ? "active-link" : ""}`}><FaQuestionCircle /> Help & Support</NavLink>
                    </Nav>

                    <div className="sidebar-logout-modern">
                        <button className="logout-btn-modern" onClick={handleLogout}>
                            <FaSignOutAlt className="me-2" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {isMobile && isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => toggleSidebar(false)}
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') toggleSidebar(false);
                    }}
                ></div>
            )}
        </>
    );
};

export default PatientSidebar;
