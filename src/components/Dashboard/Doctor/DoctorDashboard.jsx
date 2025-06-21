import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import {
    FaNotesMedical,
    FaUsers,
    FaClock,
    FaCalendarCheck,
    FaRegCalendarTimes,
    FaUserAltSlash
} from 'react-icons/fa';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useOutletContext, useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { userData } = useOutletContext();

    const [scheduled, setScheduled] = useState([]);
    const [pending, setPending] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        if (!userData.uid) return;

        const unsub = onSnapshot(
            query(collection(db, 'appointments'), where('doctorId', '==', userData.uid)),
            async (snap) => {
                const apps = [];
                const nowTs = new Date();
                for (const d of snap.docs) {
                    const data = d.data();
                    const dt = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
                    if (dt < nowTs && ['Scheduled', 'Confirmed'].includes(data.status)) {
                        await updateDoc(doc(db, 'appointments', d.id), { status: 'Pending' });
                        data.status = 'Pending';
                    }
                    apps.push({ id: d.id, ...data });
                }
                setScheduled(apps.filter(a => ['Scheduled', 'Confirmed'].includes(a.status)));
                setPending(apps.filter(a => a.status === 'Pending'));
                setCompleted(apps.filter(a => a.status === 'Completed'));
                setLoading(false);
            }
        );

        return () => unsub();
    }, [userData]);

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const getStatusBadge = status => ({
        Completed: 'success',
        Cancelled: 'danger',
        Pending: 'warning',
        Scheduled: 'primary',
        Confirmed: 'primary',
    }[status] || 'secondary');

    return (
        <>
            <h2>Welcome, Dr. {userData.name}</h2>
            <p>Manage your practice efficiently with your personal dashboard.</p>
            <p className="text-muted">
                Here’s a quick overview of your appointments, patients, and schedules. You can manage your appointments, view patient details, and check your schedule from this dashboard.
                <br />
                <strong>Note:</strong> Ensure your contact details are up-to-date for appointment reminders.
            </p>

            <Row className="mt-4 gy-4">
                <Col md={3}>
                    <Card className="text-center p-3">
                        <FaNotesMedical size={36} className="mb-2 text-primary" />
                        <h5>Upcoming</h5>
                        <h2>{loading ? <Spinner animation="border" size="sm" /> : scheduled.length}</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center p-3">
                        <FaClock size={36} className="mb-2 text-warning" />
                        <h5>Pending</h5>
                        <h2>{loading ? <Spinner animation="border" size="sm" /> : pending.length}</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center p-3">
                        <FaUsers size={36} className="mb-2 text-success" />
                        <h5>Completed</h5>
                        <h2>{loading ? <Spinner animation="border" size="sm" /> : completed.length}</h2>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center p-3">
                        <FaCalendarCheck size={36} className="mb-2 text-info" />
                        <h5>{now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h5>
                        <h6>{now.toLocaleTimeString()}</h6>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4 gy-4">
                {[{ title: "Upcoming", list: scheduled },
                { title: "Pending", list: pending }].map(({ title, list }) => (
                    <Col md={6} key={title}>
                        <Card>
                            <Card.Header className="text-center"><h5>{title} Appointments</h5></Card.Header>
                            <Card.Body>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th><th>Date</th><th>Time</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.slice(0, 5).map(a => (
                                            <tr key={a.id}>
                                                <td>{a.fullName}</td>
                                                <td>{a.appointmentDate}</td>
                                                <td>{a.appointmentTime}</td>
                                                <td><span className={`badge bg-${getStatusBadge(a.status)} text-white`}>{a.status}</span></td>
                                            </tr>
                                        ))}
                                        {list.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted">
                                                    <FaRegCalendarTimes size={20} className="me-2 text-secondary" />
                                                    No {title} appointments.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Card.Body>
                            <Card.Footer>
                                <Button variant="outline-primary" size="sm"
                                    onClick={() => navigate(`/doctor/appointments`)}>
                                    View All
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="mt-4 gy-4">
                <Col>
                    <Card>
                        <Card.Header className="text-center"><h5>Patient List</h5></Card.Header>
                        <Card.Body>
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        <th>Patient Code</th><th>Name</th><th>Age</th><th>Last Visit</th><th>Contact</th><th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completed.slice(0, 5).map((a, idx) => (
                                        <tr key={idx}>
                                            <td>{a.patientCode || 'N/A'}</td>
                                            <td>{a.fullName}</td>
                                            <td>{a.age || 'N/A'}</td>
                                            <td>{a.appointmentDate}</td>
                                            <td>{a.phone || 'N/A'}</td>
                                            <td><span className={`badge bg-${getStatusBadge(a.status)} text-white`}>{a.status}</span></td>
                                        </tr>
                                    ))}
                                    {completed.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-5">
                                                <FaUserAltSlash size={20} className="me-3 text-secondary" />
                                                No patients yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </Card.Body>
                        <Card.Footer>
                            <Button variant="outline-primary" size="sm"
                                onClick={() => navigate(`/doctor/patients`)}>
                                View All Patients
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md={12} className="text-center">
                    <Card className="p-4">
                        <div className="text-center mb-4">
                            <FaCalendarCheck size={30} className="text-primary mb-3" />
                            <h4 className="fw-bold">Manage Your Schedule</h4>
                        </div>
                        <p className="text-muted mb-4">
                            Keep your schedule organized and up-to-date. You can add, edit, or remove your availability slots.
                            Ensure your patients can book appointments at your convenience.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/doctor/schedules')}>
                            Manage Schedules
                        </Button>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default DoctorDashboard;
