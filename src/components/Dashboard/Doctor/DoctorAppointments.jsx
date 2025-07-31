import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorAppointments.css';
import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { FaCalendarTimes, FaSpinner, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

function DoctorAppointments() {
    const { currentUser } = useAuth();
    const doctorId = currentUser?.uid;
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doctorId) return;

        const q = query(
            collection(db, 'appointments'),
            where('doctorId', '==', doctorId),
            where('status', 'in', ['Scheduled', 'Confirmed', 'Pending', 'Cancelled'])
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const now = new Date();

            const data = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const appointmentData = docSnap.data();
                    const appointmentDateTime = new Date(
                        `${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`
                    );

                    if (
                        appointmentDateTime < now &&
                        appointmentData.status === 'Scheduled'
                    ) {
                        await updateDoc(doc(db, 'appointments', docSnap.id), {
                            status: 'Pending',
                        });
                        appointmentData.status = 'Pending';
                    }

                    return {
                        id: docSnap.id,
                        ...appointmentData,
                        patientName:
                            appointmentData.fullName ||
                            appointmentData.patientName ||
                            'Unknown',
                    };
                })
            );

            setAppointments(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [doctorId]);

    const handleSortChange = (e) => setSortOrder(e.target.value);
    const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
    const handleDateChange = (e) => setSelectedDate(e.target.value);

    const filteredAppointments = appointments
        .filter((appointment) =>
            appointment.patientName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
        .filter(
            (appointment) =>
                (selectedDate === '' ||
                    appointment.appointmentDate === selectedDate) &&
                (statusFilter === 'All' || appointment.status === statusFilter)
        )
        .sort((a, b) => {
            const nameA = a.patientName.toLowerCase();
            const nameB = b.patientName.toLowerCase();
            if (sortOrder === 'asc') return nameA.localeCompare(nameB);
            return nameB.localeCompare(nameA);
        });

    const handleViewPatientDetails = (appointmentId, patientId) => {
        navigate(`/doctor/patient-details/${appointmentId}/${patientId}`);
    };

    return (
        <div className="appointments-page">
            <h3 className="page-title">My Appointments</h3>

            <div className="appointments-header">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search Patient Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar"
                    />
                </div>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="date-picker"
                />

                <select
                    value={sortOrder}
                    onChange={handleSortChange}
                    className="filter-select"
                >
                    <option value="asc">Sort A-Z</option>
                    <option value="desc">Sort Z-A</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="filter-select"
                >
                    <option value="All">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="appointments-table">
                {loading ? (
                    <div className="loading-spinner">
                        <FaSpinner className="spinner-icon" />
                        <p>Loading appointments...</p>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="no-appointments">
                        <FaCalendarTimes className="no-appointments-icon" />
                        <p>No appointments found.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Patient Code</th>
                                <th>Patient</th>
                                <th>Date</th>
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
                                                handleViewPatientDetails(
                                                    appointment.id,
                                                    appointment.patientId
                                                )
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

export default DoctorAppointments;
