
// Book & retrieve appointments for patients and doctors
// This service handles booking appointments and retrieving them for both patients and doctors.



import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Book an appointment
export const bookAppointment = async (data) => {
    await addDoc(collection(db, "appointments"), data);
};

// Get appointments for a patient by user ID
export const getPatientAppointments = async (userId) => {
    const q = query(collection(db, "appointments"), where("bookedBy", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get appointments for a doctor by doctorId
export const getDoctorAppointments = async (doctorId) => {
    const q = query(collection(db, "appointments"), where("doctorId", "==", doctorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
