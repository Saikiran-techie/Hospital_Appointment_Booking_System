import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const fetchAppointments = async () => {
    return [
        { id: '1', patient: 'Alice Brown', date: '2025-05-01', time: '10:00 AM' },
        { id: '2', patient: 'Bob Johnson', date: '2025-05-01', time: '11:00 AM' }
    ];
};

export const fetchPatients = async () => {
    return [
        { id: '1', name: 'Alice Brown', age: 30, lastVisit: '2025-04-20' },
        { id: '2', name: 'Bob Johnson', age: 45, lastVisit: '2025-04-15' }
    ];
};

export const fetchDashboardStats = async () => {
    return {
        totalAppointments: 12,
        totalPatients: 5,
        today: "Monday, April 22, 2025"
    };
};

export const fetchProfile = async (doctorId) => {
    const docRef = collection(db, 'doctors');
    const q = query(docRef, where("id", "==", doctorId));
    const snapshot = await getDocs(q);
    return snapshot.docs[0]?.data();
};
