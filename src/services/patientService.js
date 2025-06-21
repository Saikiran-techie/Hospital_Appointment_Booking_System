// src/services/patientService.js

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Get patients by user ID
export const getPatientsByUserId = async (userId) => {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);

    const patients = [];
    querySnapshot.forEach((doc) => {
        patients.push({ id: doc.id, ...doc.data() });
    });

    return patients;
};

// Get appointments by bookedBy userId
export const getAppointmentsByUserId = async (userId) => {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('bookedBy', '==', userId));
    const querySnapshot = await getDocs(q);

    const appointments = [];
    querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
    });

    return appointments;
};


// Get prescriptions by patient IDs
export const getPrescriptionsByPatientIds = async (patientIds) => {
    if (patientIds.length === 0) return [];

    const prescriptionsRef = collection(db, 'prescriptions');
    const q = query(prescriptionsRef, where('patientId', 'in', patientIds));
    const querySnapshot = await getDocs(q);

    const prescriptions = [];
    querySnapshot.forEach((doc) => {
        prescriptions.push({ id: doc.id, ...doc.data() });
    });

    return prescriptions;
};

// Get reports by patient IDs
export const getReportsByPatientIds = async (patientIds) => {
    if (patientIds.length === 0) return [];

    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, where('patientId', 'in', patientIds));
    const querySnapshot = await getDocs(q);

    const reports = [];
    querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
    });

    return reports;
};
