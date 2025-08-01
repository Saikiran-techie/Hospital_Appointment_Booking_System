import React, { useState, useEffect, useRef } from 'react';
import './MyAppointments.css';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaSyncAlt, FaTrash, FaUpload, FaBan, FaClipboardCheck, FaCalendarTimes, FaClock, FaCheck } from 'react-icons/fa';
import { Spinner, Modal, Button, Form } from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, updateDoc, deleteDoc, addDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

function MyAppointments() {
    const { appointments = [], loadingAppointments, currentUser: contextUser, onViewAppointment, doctors = [] } = useOutletContext();
    const auth = getAuth();
    const fallbackUser = auth.currentUser;
    const currentUser = contextUser || fallbackUser;

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', consultationType: '' });
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [doctorAvailabilityText, setDoctorAvailabilityText] = useState('');
    const selectedDoctorAvailabilityRef = useRef(null);


    const upcomingAppointments = appointments.filter(app => ['Confirmed', 'Scheduled'].includes(app.status));
    const completedAppointments = appointments.filter(app => app.status === 'Completed');
    const cancelledAppointments = appointments.filter(app => app.status === 'Cancelled');
    const pendingAppointments = appointments.filter(app => app.status === 'Pending');


    // inside MyAppointments.jsx

    const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'long' });

    const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return { hours, minutes };
    };

    const generateTimeIntervals = (startStr, endStr) => {
        const start = parseTime(startStr);
        const end = parseTime(endStr);

        const slots = [];
        let current = new Date();
        current.setHours(start.hours, start.minutes, 0, 0);

        const endTime = new Date();
        endTime.setHours(end.hours, end.minutes, 0, 0);

        while (current < endTime) {
            const h = current.getHours();
            const m = current.getMinutes();
            const suffix = h >= 12 ? 'PM' : 'AM';
            const hour = ((h + 11) % 12 + 1);
            const formatted = `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
            slots.push(formatted);
            current.setMinutes(current.getMinutes() + 30);
        }

        return slots;
    };

    const orderedDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const generateAvailabilityText = (availability) => {
        const result = orderedDays.map(day => {
            const slot = availability[day];
            if (slot?.enabled && slot.start && slot.end) {
                return `${day.slice(0, 3)}: ${slot.start} - ${slot.end}`;
            }
            return null;
        }).filter(Boolean).join(' | ');

        return result || 'No availability set.';
    };

    const generateDatesFromAvailability = (availability) => {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 30);

        const dates = [];
        let checkDate = new Date(today);

        while (checkDate <= maxDate) {
            const dayName = getDayName(checkDate);
            if (availability[dayName]?.enabled) {
                dates.push(new Date(checkDate));
            }
            checkDate.setDate(checkDate.getDate() + 1);
        }

        return dates;
    };

    const generateTimesForDate = (date, availability) => {
        const dayName = getDayName(date);
        const slot = availability[dayName];
        if (!slot?.enabled || !slot.start || !slot.end) return [];
        return generateTimeIntervals(slot.start, slot.end);
    };

    const handleDoctorAvailabilitySetup = async (doctorId) => {
        try {
            const docSnap = await getDoc(doc(db, 'doctors', doctorId));
            if (docSnap.exists()) {
                const data = docSnap.data();
                const availability = data.availability || {};
                selectedDoctorAvailabilityRef.current = availability;
                setAvailableDates(generateDatesFromAvailability(availability));
                setDoctorAvailabilityText(generateAvailabilityText(availability));
                if (rescheduleData.date) {
                    setAvailableTimes(generateTimesForDate(rescheduleData.date, availability));
                }
            }
        } catch (err) {
            console.error('Failed to fetch doctor:', err);
        }
    };

    useEffect(() => {
        if (selectedAppointment?.doctorId) {
            handleDoctorAvailabilitySetup(selectedAppointment.doctorId);
        }
    }, [selectedAppointment]);

    const handleDateChange = (date) => {
        const availability = selectedDoctorAvailabilityRef.current;
        setRescheduleData(prev => ({ ...prev, date, time: '' }));
        if (availability) {
            setAvailableTimes(generateTimesForDate(date, availability));
        }
    };

    const handleRescheduleOpen = (app) => {
        setSelectedAppointment(app);
        setAvailableTimes([]);
        setAvailableDates([]);
        setDoctorAvailabilityText('');
        setRescheduleData({
            date: app.appointmentDate ? new Date(app.appointmentDate) : '',
            time: app.appointmentTime || '',
            consultationType: app.consultationType || '',
        });
        setShowRescheduleModal(true);
    };

    const handleRescheduleSubmit = async () => {
        const { date, time, consultationType } = rescheduleData;
        if (!date || !time || !consultationType) {
            Swal.fire('Error', 'Please fill all fields.', 'error');
            return;
        }

        await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
            appointmentDate: date.toISOString().split('T')[0],
            appointmentTime: time,
            consultationType,
            status: 'Scheduled'
        });

        setSelectedAppointment(null);
        setShowRescheduleModal(false);
        toast.success('Appointment successfully rescheduled.');
    };

    const sanitizeFileName = (name) => {
        return name
            .replace(/\s+/g, '_')
            .replace(/[^\w.\-]/g, '')
            .substring(0, 100);
    };


    const handleFileUpload = async () => {
        if (!uploadFile) {
            Swal.fire('Error', 'Please select a file to upload.', 'error');
            return;
        }

        if (!selectedAppointment?.id) {
            Swal.fire('Error', 'No appointment selected for this upload.', 'error');
            return;
        }

        if (!currentUser || !currentUser.uid) {
            Swal.fire('Error', 'User not authenticated.', 'error');
            return;
        }

        const cleanFileName = sanitizeFileName(uploadFile.name);
        const filePath = `medicalReports/${selectedAppointment.id}/${cleanFileName}`;
        console.log('Uploading to:', filePath);

        const fileRef = ref(storage, filePath);

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(uploadFile.type)) {
            Swal.fire('Invalid File Type', 'Please upload a PDF, JPEG, or PNG file.', 'error');
            return;
        }
        if (uploadFile.size > 5 * 1024 * 1024) {
            Swal.fire('File Too Large', 'Please upload a file smaller than 5MB.', 'error');
            return;
        }

        try {
            if (uploadFile.size === 0) {
                throw new Error('Cannot upload an empty file.');
            }

            setUploading(true);  // 👉 start spinner

            await uploadBytes(fileRef, uploadFile, {
                contentType: uploadFile.type,
            });

            const downloadURL = await getDownloadURL(fileRef);

            // 🔍 Check if a medicalReports doc exists for this appointment
            const reportsQuery = query(
                collection(db, 'medicalReports'),
                where('appointmentId', '==', selectedAppointment.id)
            );
            const querySnapshot = await getDocs(reportsQuery);

            if (!querySnapshot.empty) {
                // If doc exists — append to files array
                const reportDoc = querySnapshot.docs[0];
                const reportDocRef = doc(db, 'medicalReports', reportDoc.id);
                const existingFiles = reportDoc.data().files || [];

                await updateDoc(reportDocRef, {
                    files: [
                        ...existingFiles,
                        {
                            reportTitle: uploadFile.name,
                            fileURL: downloadURL,
                            uploadedAt: new Date(),
                            uploadedBy: currentUser.uid,
                        }
                    ]
                });
            } else {
                // If no doc exists — create a new one
                await addDoc(collection(db, 'medicalReports'), {
                    appointmentId: selectedAppointment.id,
                    patientId: selectedAppointment.bookedBy,
                    createdBy: currentUser.uid,
                    createdAt: new Date(),
                    files: [
                        {
                            reportTitle: uploadFile.name,
                            fileURL: downloadURL,
                            uploadedAt: new Date(),
                            uploadedBy: currentUser.uid,
                        }
                    ]
                });
            }

            setUploading(false);  // 👉 stop spinner
            Swal.fire('Uploaded!', 'Medical report uploaded successfully.', 'success');
            setUploadFile(null);
            setShowUploadModal(false);

        } catch (error) {
            console.error('Upload error:', error);
            setUploading(false);  // 👉 stop spinner
            Swal.fire('Upload Failed', error.message, 'error');
        }
    };

    const cancelAppointment = async (app) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to cancel this appointment?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it!',
        });

        if (result.isConfirmed) {
            await updateDoc(doc(db, 'appointments', app.id), { status: 'Cancelled' });
            Swal.fire('Cancelled!', 'Appointment has been cancelled.', 'success');
        }
    };

    const deleteAppointment = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Appointment?',
            text: 'This will completely remove the appointment.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(db, 'appointments', id));
            Swal.fire('Deleted!', 'Appointment has been removed.', 'success');
        }
    };

    return (
        <div className="appointments-container">
            <h3 className='section-heading text-primary'>My Appointments</h3>
            <br />

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card scheduled">
                    <FaCalendarAlt size={30} />
                    <h4>Scheduled</h4>
                    <p>{upcomingAppointments.length}</p>
                </div>
                <div className="summary-card completed">
                    <FaCheckCircle size={30} />
                    <h4>Completed</h4>
                    <p>{completedAppointments.length}</p>
                </div>
                <div className="summary-card cancelled">
                    <FaTimesCircle size={30} />
                    <h4>Cancelled</h4>
                    <p>{cancelledAppointments.length}</p>
                </div>
                <div className="summary-card pending">
                    <FaClock size={30} />
                    <h4>Pending</h4>
                    <p>{pendingAppointments.length}</p>
                </div>
            </div>

            <hr />

            {/* Upcoming */}
            <div className="appointments-section">
                <h4>Upcoming Appointments</h4>
                {loadingAppointments ? (
                    <Spinner animation="border" variant="primary" />
                ) : (
                    <div className="appointments-list">
                        {upcomingAppointments.length === 0 ? (
                            <div className="empty-state">
                                <FaCalendarTimes size={50} className="icon upcoming" />
                                <h5>No appointments found</h5>
                                <p>You have no upcoming appointments.</p>
                            </div>
                        ) : (
                            upcomingAppointments.map(app => (
                                <div key={app.id} className="appointments-card">
                                    <div className="appointment-info">
                                        <h6 className="mb-2 text-primary">Dr. {app.doctor}</h6>
                                        <p>{app.specialization}</p>
                                        <p><strong>Appointment Date & Time:</strong>
                                            {app.appointmentDate && app.appointmentTime
                                                ? ` ${app.appointmentDate} & ${app.appointmentTime}`
                                                : 'N/A'}
                                        </p>
                                        <p><strong>Patient:</strong> {app.fullName} ({app.patientCode})</p>
                                        <p><strong>Consultation Type:</strong> {app.consultationType}</p>
                                        {app.paymentId && <p><strong>Payment ID:</strong> {app.paymentId}</p>}
                                        <p className={`badge bg-${app.status === 'Completed'
                                            ? 'success'
                                            : app.status === 'Cancelled'
                                                ? 'danger'
                                                : app.status === 'Pending'
                                                    ? 'warning'
                                                    : 'primary'
                                            }`}>{app.status}</p>
                                    </div>
                                    <div className="appointment-actions">
                                        <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
                                            <button
                                                className="view-btn"
                                                onClick={() => onViewAppointment(app.id)}
                                            >
                                                <FaEye />
                                            </button>
                                        </OverlayTrigger>

                                        <OverlayTrigger placement="top" overlay={<Tooltip>Reschedule</Tooltip>}>
                                            <button className="reschedule-btn" onClick={() => handleRescheduleOpen(app)}>
                                                <FaSyncAlt />
                                            </button>
                                        </OverlayTrigger>

                                        <OverlayTrigger placement="top" overlay={<Tooltip>Upload Report</Tooltip>}>
                                            <button id="upload-btn" onClick={() => {
                                                setSelectedAppointment(app);
                                                setShowUploadModal(true);
                                            }}>
                                                <FaUpload />
                                            </button>
                                        </OverlayTrigger>

                                        <OverlayTrigger placement="top" overlay={<Tooltip>Cancel</Tooltip>}>
                                            <button className="cancel-btn" onClick={() => cancelAppointment(app)}>
                                                <FaTimesCircle />
                                            </button>
                                        </OverlayTrigger>

                                        <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                                            <button className="delete-btn" onClick={() => deleteAppointment(app.id)}>
                                                <FaTrash />
                                            </button>
                                        </OverlayTrigger>

                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <hr />

            {/* Pending */}
            <div className="appointments-section">
                <h4>Pending Appointments</h4>

                <div className="appointments-list">
                    {pendingAppointments.length === 0 ? (
                        <div className="empty-state">
                            <FaBan size={50} className="icon pending" />
                            <h5>No pending appointments</h5>
                            <p>You're all caught up — no pending appointments left.</p>
                        </div>
                    ) : (
                        pendingAppointments.map(app => (
                            <div key={app.id} className="appointments-card">
                                <div className="appointment-info">
                                    <h6 className="mb-2 text-primary">Dr. {app.doctor}</h6>
                                    <p>{app.specialization}</p>
                                    <p><strong>Appointment Date & Time:</strong>
                                        {app.appointmentDate && app.appointmentTime
                                            ? ` ${app.appointmentDate} & ${app.appointmentTime}`
                                            : 'N/A'}
                                    </p>
                                    <p><strong>Patient:</strong> {app.fullName} ({app.patientCode})</p>
                                    <p><strong>Consultation Type:</strong> {app.consultationType}</p>
                                    {app.paymentId && <p><strong>Payment ID:</strong> {app.paymentId}</p>}
                                    <p className={`badge bg-warning`}>Pending</p>
                                </div>
                                <div className="appointment-actions">
                                    <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
                                        <button
                                            className="view-btn"
                                            onClick={() => onViewAppointment(app.id)}
                                        >
                                            <FaEye />
                                        </button>
                                    </OverlayTrigger>

                                    <OverlayTrigger placement="top" overlay={<Tooltip>Reschedule</Tooltip>}>
                                        <button className="reschedule-btn" onClick={() => handleRescheduleOpen(app)}>
                                            <FaSyncAlt />
                                        </button>
                                    </OverlayTrigger>

                                    <OverlayTrigger placement="top" overlay={<Tooltip>Cancel</Tooltip>}>
                                        <button className="cancel-btn" onClick={() => cancelAppointment(app)}>
                                            <FaTimesCircle />
                                        </button>
                                    </OverlayTrigger>

                                    <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                                        <button className="delete-btn" onClick={() => deleteAppointment(app.id)}>
                                            <FaTrash />
                                        </button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <hr />

            {/* Completed */}
            <div className="appointments-section">
                <h4>Past Appointments</h4>
                <div className="appointments-list">
                    {completedAppointments.length === 0 ? (
                        <div className="empty-state">
                            <FaClipboardCheck size={50} className="icon completed" />
                            <h5>No appointments found</h5>
                            <p>You have no completed appointments.</p>
                        </div>
                    ) : (
                        completedAppointments.map(app => (
                            <div key={app.id} className="appointments-card">
                                <div className="appointment-info">
                                    <h6 className="mb-2 text-primary">Dr. {app.doctor}</h6>
                                    <p>{app.specialization}</p>
                                    {/* <p><strong>Appointment Date & Time:</strong>
                                    {app.appointmentDate && app.appointmentTime
                                        ? ` ${app.appointmentDate} & ${app.appointmentTime}`
                                        : 'N/A'}
                                </p> */}
                                    <p><strong>Patient:</strong> {app.fullName} ({app.patientCode})</p>
                                    <p><strong>Consultation Type:</strong> {app.consultationType}</p>
                                    {app.paymentId && <p><strong>Payment ID:</strong> {app.paymentId}</p>}
                                    <p className={`badge bg-${app.status === 'Completed'
                                        ? 'success'
                                        : app.status === 'Cancelled'
                                            ? 'danger'
                                            : 'primary'
                                        }`}>{app.status}</p>
                                </div>
                                <div className="appointment-actions">
                                    <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
                                        <button
                                            className="view-btn"
                                            onClick={() => onViewAppointment(app.id)}
                                        >
                                            <FaEye />
                                        </button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <hr />

            {/* Cancelled */}
            <div className="appointments-section">
                <h4>Cancelled Appointments</h4>
                <div className="appointments-list">
                    {cancelledAppointments.length === 0 ? (
                        <div className="empty-state">
                            <FaBan size={50} className="icon cancelled" />
                            <h5>No appointments found</h5>
                            <p>You have no cancelled appointments.</p>
                        </div>
                    ) : (
                        cancelledAppointments.map(app => (
                            <div key={app.id} className="appointments-card">
                                <div className="appointment-info">
                                    <h6 className="mb-2 text-primary">Dr. {app.doctor}</h6>
                                    <p>{app.specialization}</p>
                                    <p><strong>Appointment Date & Time:</strong>
                                        {app.appointmentDate && app.appointmentTime
                                            ? ` ${app.appointmentDate} & ${app.appointmentTime}`
                                            : 'N/A'}
                                    </p>
                                    <p><strong>Patient:</strong> {app.fullName} ({app.patientCode})</p>
                                    <p><strong>Consultation Type:</strong> {app.consultationType}</p>
                                    {app.paymentId && <p><strong>Payment ID:</strong> {app.paymentId}</p>}
                                    <p className={`badge bg-${app.status === 'Completed'
                                        ? 'success'
                                        : app.status === 'Cancelled'
                                            ? 'danger'
                                            : 'primary'
                                        }`}>{app.status}</p>
                                </div>
                                <div className="appointment-actions">
                                    <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
                                        <button
                                            className="view-btn"
                                            onClick={() => onViewAppointment(app.id)}
                                        >
                                            <FaEye />
                                        </button>
                                    </OverlayTrigger>

                                    <OverlayTrigger placement="top" overlay={<Tooltip>Reschedule</Tooltip>}>
                                        <button className="reschedule-btn" onClick={() => handleRescheduleOpen(app)}>
                                            <FaSyncAlt />
                                        </button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reschedule Modal */}
            <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Reschedule Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <>
                            <h6 className="mb-2 text-primary">Dr. {selectedAppointment.doctor} - {selectedAppointment.specialization}</h6>
                            <div className="mb-2 text-success d-flex align-items-center gap-2">
                                🗓️ Availability: {doctorAvailabilityText}
                            </div>
                        </>
                    )}

                    <Form>
                        <Form.Group>
                            <Form.Label>Select New Date</Form.Label>
                            <DatePicker
                                selected={rescheduleData.date}
                                onChange={handleDateChange}
                                includeDates={availableDates}
                                placeholderText="Select a date"
                                dateFormat="EEEE, MMMM d, yyyy"
                                className="form-control"
                            />
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Select Time</Form.Label>
                            <Form.Select
                                value={rescheduleData.time}
                                onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}>
                                <option value="">Select time</option>
                                {availableTimes.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Consultation Type</Form.Label>
                            <Form.Select
                                value={rescheduleData.consultationType}
                                onChange={(e) => setRescheduleData(prev => ({ ...prev, consultationType: e.target.value }))}>
                                <option value="">Select</option>
                                <option value="In-Person">In-Person</option>
                                <option value="Vedio-Call">Vedio-Call</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleRescheduleSubmit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            {/* Upload Medical Report Modal */}
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Medical Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="uploadFile">
                        <Form.Label>Select File (PDF, JPG, PNG, max 5MB)</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    {/* <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button> */}
                    <Button variant="primary" onClick={handleFileUpload} disabled={uploading}>
                        {uploading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Uploading...
                            </>
                        ) : (
                            'Upload'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default MyAppointments;
