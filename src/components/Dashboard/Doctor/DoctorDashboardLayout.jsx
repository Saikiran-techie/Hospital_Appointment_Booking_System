
import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebaseConfig';
import { getDoctorProfile } from '../../../services/doctorService';

import DoctorTopNavbar from './DoctorTopNavbar';
import DoctorSidebar from './DoctorSidebar';
// import ChatWindow from '../../ChatWindow/ChatWindow';

import './DoctorDashboard.css';

const DoctorDashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [userData, setUserData] = useState({});
    const [doctorProfile, setDoctorProfile] = useState({});
    const [appointments, setAppointments] = useState([]);
    const [scheduledAppointments, setScheduledAppointments] = useState([]);
    const [completedAppointments, setCompletedAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);

    // const [showChat, setShowChat] = useState(false);
    // const [chatAppointmentId, setChatAppointmentId] = useState(null);
    // const [chatAppointmentData, setChatAppointmentData] = useState(null);

    useEffect(() => {
        let unsubscribeAppointments = () => { };

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const { email, uid } = user;
                const profileData = await getDoctorProfile(uid);
                if (profileData) {
                    setDoctorProfile(profileData);
                    setUserData({ name: profileData.name, email, uid });
                } else {
                    setUserData({ name: 'Doctor', email, uid });
                }
                unsubscribeAppointments = fetchDoctorAppointments(uid);
            } else {
                navigate('/login');
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeAppointments();
        };
    }, [navigate]);

    const fetchDoctorAppointments = (userId) => {
        const qAppointments = query(collection(db, 'appointments'), where('doctorId', '==', userId));
        const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
            const allAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(allAppointments);
            setScheduledAppointments(allAppointments.filter(app => app.status === 'Scheduled' || app.status === 'Confirmed'));
            setCompletedAppointments(allAppointments.filter(app => app.status === 'Completed'));
            setPendingAppointments(allAppointments.filter(app => app.status === 'Pending'));
        });
        return unsubscribeAppointments;
    };

    const handleLogout = () => {
        signOut(auth).then(() => navigate('/login')).catch(error => console.error('Logout error:', error));
    };

    // const openChatWindow = (appointmentId, appointmentData) => {
    //     setChatAppointmentId(appointmentId);
    //     setChatAppointmentData(appointmentData);
    //     setShowChat(true);
    // };

    // const handleCloseChat = () => {
    //     setShowChat(false);
    //     setChatAppointmentId(null);
    //     setChatAppointmentData(null);
    // };

    return (
        <div id="doctor-dashboard">
            <DoctorTopNavbar
                userData={userData}
                doctorProfile={doctorProfile}
                handleLogout={handleLogout}
            />
            <div id="dashboard-body">
                <DoctorSidebar />
                <div className="dashboard-content">
                    <Outlet
                        context={{
                            userData,
                            doctorProfile,
                            appointments,
                            scheduledAppointments,
                            completedAppointments,
                            pendingAppointments,
                            // openChatWindow,
                        }}
                    />
                </div>
            </div>
            {/* {showChat && chatAppointmentData && chatAppointmentId && (
                <ChatWindow
                    currentUser={userData}
                    appointmentData={chatAppointmentData}
                    appointmentId={chatAppointmentId}
                    userRole="doctor"
                    onClose={handleCloseChat}
                />
            )} */}
        </div>
    );
};

export default DoctorDashboardLayout;
