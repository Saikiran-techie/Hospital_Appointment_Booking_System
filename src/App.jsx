import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { AuthProvider } from './context/AuthContext';

// Auth Components
import LandingPage from "./components/LandingPage/LandingPage";
import AboutDoctors from "./components/LandingPage/AboutDoctors";
import TermsPage from './components/LandingPage/TermsPage';
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';
import ResetPassword from './components/Authentication/ResetPassword';

// Patient Components
import PatientDashboardLayout from './components/Dashboard/Patient/PatientDashboardLayout';
import PatientDashboard from "./components/Dashboard/Patient/PatientDashboard";
import BookAppointment from "./components/Dashboard/Patient/BookAppointment";
import PaymentPage from "./components/Dashboard/Patient/PaymentPage";
import MyAppointments from "./components/Dashboard/Patient/MyAppointments";
import AppointmentDetails from "./components/Dashboard/Patient/AppointmentDetails";
import PatientMedicalReports from "./components/Dashboard/Patient/PatientMedicalReports";
import PatientPrescription from "./components/Dashboard/Patient/PatientPrescription";
import PaymentHistory from "./components/Dashboard/Patient/PaymentHistory";
import UserProfile from "./components/Dashboard/Patient/UserProfile";
import HelpSupport from "./components/Dashboard/Patient/HelpSupport";

// Doctor Components
import DoctorDashboardLayout from './components/Dashboard/Doctor/DoctorDashboardLayout';
import DoctorDashboard from './components/Dashboard/Doctor/DoctorDashboard';
import DoctorAppointments from './components/Dashboard/Doctor/DoctorAppointments';
import PatientDetails from './components/Dashboard/Doctor/PatientDetails';
import DoctorPatients from './components/Dashboard/Doctor/DoctorPatients';
import Schedules from "./components/Dashboard/Doctor/Schedules";
import DoctorProfile from './components/Dashboard/Doctor/DoctorProfile';





const App = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/doctor/:id" element={<AboutDoctors />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Patient Routes */}
        <Route path="/patient" element={<PatientDashboardLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="bookAppointment" element={<BookAppointment />} />
          <Route path="bookAppointment/PaymentPage" element={<PaymentPage />} />
          <Route path="myAppointments" element={<MyAppointments />} />
          <Route path="myAppointments/:id" element={<AppointmentDetails />} />
          <Route path="medical-reports" element={<PatientMedicalReports />} />
          <Route path="prescriptions" element={<PatientPrescription />} />
          <Route path="payment-history" element={<PaymentHistory />} />
          <Route path="userprofile" element={<UserProfile />} />
          <Route path="helpsupport" element={<HelpSupport />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={<DoctorDashboardLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patient-details/:appointmentId/:patientId" element={<PatientDetails />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>

        {/* Add more routes as needed */}
        {/* <Route path="/admin-dashboard" element={<AdminDashboard/>} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>


  );
};

export default App;
