import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
    FaHome,
    FaNotesMedical,
    FaUsers,
    FaCalendarCheck,
    FaUserMd,
    FaBars,
    FaTimes,
    FaSignOutAlt,
} from 'react-icons/fa';
import logoImg from '../../../assets/brand-logo.png';
import '../Patient/PatientSidebar.css';

const DoctorSidebar = ({ handleKeyPress = () => { } }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
            if (window.innerWidth >= 992) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) setSidebarOpen(false);
    };

    const handleLogout = () => {
        navigate('/');
        if (isMobile) setSidebarOpen(false);
    };

    const navLinks = [
        { path: '/doctor/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/doctor/appointments', icon: <FaNotesMedical />, label: 'Appointments' },
        { path: '/doctor/patients', icon: <FaUsers />, label: 'Patients' },
        { path: '/doctor/schedules', icon: <FaCalendarCheck />, label: 'Schedules' },
        { path: '/doctor/profile', icon: <FaUserMd />, label: 'Profile' },
    ];

    return (
        <>
            {/* Mini sidebar on mobile when closed */}
            {isMobile && !sidebarOpen && (
                <div className="mini-sidebar">
                    <button className="mini-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
                        <FaBars />
                    </button>
                    <div className="mini-sidebar-icons">
                        {navLinks.map(({ path, icon }) => (
                            <span
                                key={path}
                                onClick={() => handleNavigate(path)}
                                className={`nav-icon ${location.pathname === path ? 'active-icon' : ''}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') handleNavigate(path);
                                }}
                            >
                                {icon}
                            </span>
                        ))}
                    </div>
                    {/* Mini sidebar logout icon */}
                    <div className="mini-sidebar-icons mt-auto">
                        <button
                            className="logout-icon-modern"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            )}

            {/* Full sidebar */}
            <div className={`sidebar ${isMobile ? (sidebarOpen ? 'open' : 'closed') : 'desktop'}`}>
                <div className="sidebar-header">
                    <img src={logoImg} alt="Hospital Logo" />
                    <span>MediConnect Hospital</span>
                    {isMobile && (
                        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <Nav className="flex-column sidebar-nav">
                    {navLinks.map(({ path, icon, label }) => (
                        <span
                            key={path}
                            className={`nav-link ${location.pathname === path ? 'active-link' : ''}`}
                            onClick={() => handleNavigate(path)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyPress(e, () => handleNavigate(path))}
                        >
                            {icon} {label}
                        </span>
                    ))}
                </Nav>

                {/* Large sidebar logout button */}
                <div className="sidebar-logout-modern">
                    <button
                        className="logout-btn-modern"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt className="me-2" /> Logout
                    </button>

                    {/* <Button
                        variant="outline-danger"
                        className="text-center d-flex align-items-center gap-2"
                        style={{ width: '100%' }}
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt /> Logout
                    </Button> */}
                </div>
            </div>

            {/* Overlay on mobile when sidebar open */}
            {isMobile && sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSidebarOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default DoctorSidebar;
