import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { FaCalendarTimes } from 'react-icons/fa';

const PatientDashboard = () => {
    const { userData } = useOutletContext();
    const [appointments, setAppointments] = useState([]);
    const [latestReport, setLatestReport] = useState(null);
    const [latestPrescription, setLatestPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (userData?.uid) {
            fetchDashboardData(userData.uid);
        }
    }, [userData]);

    const fetchDashboardData = async (userId) => {
        try {
            setLoading(true);

            const apptQuery = query(collection(db, 'appointments'), where('bookedBy', '==', userId));
            const apptSnap = await getDocs(apptQuery);
            const apptList = apptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setAppointments(apptList);

            const upcoming = apptList
                .filter(a => a.status === 'Scheduled' || a.status === 'Confirmed')
                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

            if (upcoming.length > 0) {
                const latestApptId = upcoming[0].id;

                const reportQuery = query(
                    collection(db, 'medicalReports'),
                    where('appointmentId', '==', latestApptId),
                    orderBy('date', 'desc'),
                    limit(1)
                );
                const reportSnap = await getDocs(reportQuery);
                if (!reportSnap.empty) {
                    setLatestReport(reportSnap.docs[0].data());
                }

                const prescriptionQuery = query(
                    collection(db, 'prescriptions'),
                    where('appointmentId', '==', latestApptId),
                    orderBy('date', 'desc'),
                    limit(1)
                );
                const presSnap = await getDocs(prescriptionQuery);
                if (!presSnap.empty) {
                    setLatestPrescription(presSnap.docs[0].data());
                }
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const upcomingAppointments = appointments
        .filter(app => app.status === 'Confirmed' || app.status === 'Scheduled')
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    const latestAppointment = upcomingAppointments[0];

    return (
        <div>
            <h2>Welcome, {userData?.name || 'Guest'}</h2>
            <p className="text-muted">Here’s a quick overview of your recent activities.
                You can view your upcoming appointments, past appointments, recent medical reports, active prescriptions and and manage your health records from the sidebar. 
                If you need to book a new appointment, click the button below.</p>
            <p className="text-muted">
                If you have any questions or need assistance, feel free to contact our support team.
            </p>
            <p className="text-muted">
                Thank you for choosing our hospital for your healthcare needs. We wish you good health and a speedy recovery!
            </p>

            <Card className="mt-4 dashboard-card shadow-sm">
                <Card.Body>
                    <h4 className="mb-0">Upcoming Appointments</h4>
                    <hr />
                    {loading ? (
                        <div className="mt-3"><Spinner animation="border" variant="primary" /></div>
                    ) : !latestAppointment ? (
                        <div className="empty-state">
                            <FaCalendarTimes size={50} className="icon upcoming" />
                            <h5>No appointments found</h5>
                            <p>You have no upcoming appointments.</p>
                            <Button variant="primary" onClick={() => navigate('/patient/bookAppointment')} className="mt-2">Book an Appointment</Button>
                        </div>
                    ) : (
                        <Card className="appointment-card mt-3">
                            <Card.Body>
                                <p><strong>Patient Name:</strong> {latestAppointment.fullName} ({latestAppointment.patientCode})</p>
                                <p><strong>Doctor:</strong> Dr. {latestAppointment.doctor} ({latestAppointment.specialization})</p>
                                <p><strong>Date & Time:</strong> {latestAppointment.appointmentDate} at {latestAppointment.appointmentTime}</p>
                                <p><strong>Status:</strong> <span className={`badge bg-${latestAppointment.status === 'Completed' ? 'success' : latestAppointment.status === 'Cancelled' ? 'danger' : 'primary'}`}>{latestAppointment.status}</span></p>
                            </Card.Body>
                            <Card.Footer className="text-end">
                                <Button variant="primary" onClick={() => navigate(`/patient/myAppointments/${latestAppointment.id}`)}>View Details</Button>
                            </Card.Footer>
                        </Card>
                    )}
                </Card.Body>
            </Card>

            <Row className="mt-4">
                <Col md={6}>
                    <Card className="dashboard-card shadow-sm">
                        <Card.Body>
                            <h4>Recent Medical Report</h4>
                            <hr />
                            {loading ? (
                                <div className="mt-3"><Spinner animation="border" variant="primary" /></div>
                            ) : latestReport ? (
                                <div>
                                    <strong>{latestReport.patientName}</strong> ({latestReport.patientCode})<br />
                                    <small>Dr. {latestReport.doctor} ({latestReport.specialization})</small><br />
                                    <span>{new Date(latestReport.date.seconds * 1000).toLocaleDateString()}</span><br />
                                    <a href={latestReport.fileUrl} target="_blank" rel="noopener noreferrer">View Report</a>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FaCalendarTimes size={40} className="icon reports" />
                                    <h5>No reports found</h5>
                                    <p>You have no recent medical reports.</p>
                                    <Button variant="primary" onClick={() => navigate('/patient/medical-reports')} className="mt-2">View All</Button>

                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="dashboard-card shadow-sm">
                        <Card.Body>
                            <h4>Active Prescription</h4>
                            <hr />
                            {loading ? (
                                <div className="mt-3"><Spinner animation="border" variant="primary" /></div>
                            ) : latestPrescription ? (
                                <div>
                                    <strong>{latestPrescription.patientName}</strong> ({latestPrescription.patientCode})<br />
                                    <small>Dr. {latestPrescription.doctor} ({latestPrescription.specialization})</small><br />
                                    <p><strong>Date:</strong> {new Date(latestPrescription.date.seconds * 1000).toLocaleDateString()}</p>
                                    <p><strong>Medication:</strong> {latestPrescription.medication}</p>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FaCalendarTimes size={40} className="icon prescriptions" />
                                    <h5>No prescriptions found</h5>
                                    <p>You have no active prescriptions.</p>
                                    <Button variant="primary" onClick={() => navigate('/patient/prescriptions')} className="mt-2">View All</Button>

                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PatientDashboard;
