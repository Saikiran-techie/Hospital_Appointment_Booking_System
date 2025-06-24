import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getUserDetails } from '../../../services/userService';

import PatientSidebar from './PatientSidebar';
import PatientTopNavbar from './PatientTopNavbar';

import './PatientDashboard.css';

const PatientDashboardLayout = () => {
    const [userData, setUserData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const details = await getUserDetails(user.uid);
                    setUserData({ ...user, ...details });
                    await updatePendingAppointments();
                    await fetchAppointments(user.uid);
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const updatePendingAppointments = async () => {
        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, where("status", "in", ["Scheduled", "Confirmed"]));
        const snapshot = await getDocs(q);
        const now = new Date();

        const updates = snapshot.docs.map(async (docSnap) => {
            const appData = docSnap.data();
            if (appData.appointmentDate && appData.appointmentTime) {
                const appointmentDateTime = new Date(`${appData.appointmentDate} ${appData.appointmentTime}`);
                if (appointmentDateTime <= now) {
                    await updateDoc(doc(db, 'appointments', docSnap.id), { status: 'Pending' });
                }
            }
        });

        await Promise.all(updates);
    };

    const fetchAppointments = async (uid) => {
        setLoadingAppointments(true);
        try {
            const appointmentsRef = collection(db, 'appointments');
            const q = query(appointmentsRef, where("bookedBy", "==", uid));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
        setLoadingAppointments(false);
    };

    const handleLogout = () => {
        signOut(auth).then(() => navigate('/login'));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleViewAppointment = (appointmentId) => {
        navigate(`/patient/myAppointments/${appointmentId}`);
    };

    return (
        <div className="patient-dashboard">
            <PatientTopNavbar
                userData={userData}
                handleLogout={handleLogout}
                prevPage={true}
                handleBack={() => navigate(-1)}
            />
            <div className="dashboard-body">
                <PatientSidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
                <div className="dashboard-content">
                    <Outlet context={{
                        appointments,
                        loadingAppointments,
                        userData, // ✅ fixed context key
                        onViewAppointment: handleViewAppointment,
                    }} />
                </div>
            </div>
        </div>
    );
};

export default PatientDashboardLayout;
