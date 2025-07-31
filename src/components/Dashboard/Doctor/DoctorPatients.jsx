import React, { useState, useEffect } from 'react';
import './DoctorPatients.css';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaUserInjured } from 'react-icons/fa';

function DoctorPatients() {
    const { currentUser } = useAuth();
    const doctorId = currentUser?.uid;
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        if (!doctorId) {
            console.warn('Doctor ID is undefined, cannot fetch appointments.');
            return;
        }

        const q = query(
            collection(db, 'appointments'),
            where('doctorId', '==', doctorId),
            where('status', '==', 'Completed')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((docSnap) => {
                const appointmentData = docSnap.data();
                return {
                    id: docSnap.id,
                    ...appointmentData,
                    patientName: appointmentData.fullName || 'Unknown',
                    patientAge: appointmentData.age || 'N/A',
                    patientGender: appointmentData.gender || 'N/A',
                    patientBloodGroup: appointmentData.bloodGroup || 'N/A',
                    patientEmail: appointmentData.email || 'N/A',
                    patientPhone: appointmentData.phone || 'N/A',
                    patientAddress: appointmentData.address || 'N/A',
                };
            });
            setAppointments(data);
        });

        return () => unsubscribe();
    }, [doctorId]);

    const filteredAppointments = appointments
        .filter((appointment) =>
            appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((appointment) =>
            filterDate ? appointment.appointmentDate === filterDate : true
        )
        .sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.patientName.localeCompare(b.patientName);
            } else {
                return b.patientName.localeCompare(a.patientName);
            }
        });

    const handleViewPatientDetails = (appointmentId, patientId) => {
        navigate(`/doctor/patient-details/${appointmentId}/${patientId}`);
    };

    return (
        <div className="patients-page">
            <h3 className="page-title">Consulted Patients</h3>

            <div className="patients-header">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Patient Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar"
                    />
                </div>

                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="filter-date"
                    title="Filter by Date"
                />

                <button
                    className="sort-button"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    title="Sort by Name"
                >
                    {sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
                </button>
            </div>

            <div className="patients-table">
                {filteredAppointments.length === 0 ? (
                    <div className="empty-state">
                        <FaUserInjured size={70} className="empty-icon" />
                        <h5>No Completed Consultations Found</h5>
                        <p>Try adjusting your search, filter, or date selection.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Patient Code/ID</th>
                                <th>Patient</th>
                                <th>Last Visit</th>
                                <th>Time</th>
                                <th>Doctor</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.patientCode || 'N/A'}</td>
                                    <td>{appointment.patientName}</td>
                                    <td>{appointment.appointmentDate}</td>
                                    <td>{appointment.appointmentTime}</td>
                                    <td>{appointment.doctor}</td>
                                    <td>
                                        <span
                                            className={`status ${appointment.status.toLowerCase()}`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() =>
                                                handleViewPatientDetails(appointment.id, appointment.patientId)
                                            }
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DoctorPatients;
