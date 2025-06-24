import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, uploadBytes, ref as storageRef } from 'firebase/storage';
import { db, storage } from '../../../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import { FaDownload, FaFileMedical, FaFilePdf, FaFileImage } from 'react-icons/fa';
import { Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import '../Patient/AppointmentDetails.css';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useOutletContext } from 'react-router-dom';
import ChatWindow from '../../ChatWindow/ChatWindow';

function PatientDetails() {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [medicalReports, setMedicalReports] = useState([]);
    const [loadingAppointment, setLoadingAppointment] = useState(true);
    const [loadingReports, setLoadingReports] = useState(true);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
    const [uploadingPrescription, setUploadingPrescription] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [prescriptionText, setPrescriptionText] = useState('');
    const [prescriptionFile, setPrescriptionFile] = useState(null);
    const [showChat, setShowChat] = useState(false);

    const { currentUser } = useAuth();
    const { openChatWindow } = useOutletContext();

    // Fetch appointment details
    useEffect(() => {
        if (!appointmentId) return;
        const fetchAppointment = async () => {
            try {
                const docRef = doc(db, 'appointments', appointmentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAppointment({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error('Error fetching appointment:', err);
            } finally {
                setLoadingAppointment(false);
            }
        };
        fetchAppointment();
    }, [appointmentId]);

    // Fetch reports
    useEffect(() => {
        if (!appointmentId) return;
        const fetchReports = async () => {
            try {
                const reportsRef = collection(db, 'medicalReports');
                const reportsQuery = query(reportsRef, where('appointmentId', '==', appointmentId));
                const snapshot = await getDocs(reportsQuery);
                const reports = snapshot.docs.flatMap((doc) =>
                    Array.isArray(doc.data().files)
                        ? doc.data().files.map((file) => ({
                            reportDocId: doc.id,
                            ...file
                        }))
                        : []
                );
                setMedicalReports(reports);
            } catch (err) {
                console.error('Error fetching reports:', err);
            } finally {
                setLoadingReports(false);
            }
        };
        fetchReports();
    }, [appointmentId]);

    // Fetch prescriptions
    useEffect(() => {
        if (!appointmentId) return;
        const fetchPrescriptions = async () => {
            try {
                const prescQ = query(collection(db, 'prescriptions'), where('appointmentId', '==', appointmentId));
                const prescSnap = await getDocs(prescQ);
                const prescriptions = prescSnap.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                    fileName: doc.data().filePath ? doc.data().filePath.split('/').pop() : ''
                }));
                setAppointment((prev) => (prev ? { ...prev, prescriptions } : prev));
            } catch (err) {
                console.error('Error fetching prescriptions:', err);
            } finally {
                setLoadingPrescriptions(false);
            }
        };
        fetchPrescriptions();
    }, [appointmentId]);

    const sanitizeFileName = (name) => name.replace(/[^\w.\-()]/g, '_');

    const handlePrescriptionSubmit = async () => {
        if (!prescriptionText.trim() && !prescriptionFile) {
            Swal.fire('Error', 'Please enter a prescription note or upload a file.', 'error');
            return;
        }
        if (!currentUser || !currentUser.uid) {
            Swal.fire('Error', 'User not authenticated.', 'error');
            return;
        }
        setUploadingPrescription(true);
        try {
            let fileURL = '';
            let filePath = '';
            if (prescriptionFile) {
                const cleanFileName = sanitizeFileName(prescriptionFile.name);
                const filePathFull = `prescriptions/${appointmentId}/${cleanFileName}`;
                const fileRef = storageRef(storage, filePathFull);
                const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                if (!allowedTypes.includes(prescriptionFile.type)) {
                    Swal.fire('Invalid File Type', 'Please upload a PDF, JPEG, or PNG file.', 'error');
                    setUploadingPrescription(false);
                    return;
                }
                if (prescriptionFile.size > 5 * 1024 * 1024) {
                    Swal.fire('File Too Large', 'Please upload a file smaller than 5MB.', 'error');
                    setUploadingPrescription(false);
                    return;
                }
                if (prescriptionFile.size === 0) {
                    throw new Error('Cannot upload an empty file.');
                }
                await uploadBytes(fileRef, prescriptionFile, { contentType: prescriptionFile.type });
                fileURL = await getDownloadURL(fileRef);
                filePath = fileRef.fullPath;
            }
            await addDoc(collection(db, 'prescriptions'), {
                appointmentId,
                doctorId: appointment.doctorId,
                patientCreatedBy: appointment.bookedBy,
                prescriptionText,
                fileURL,
                filePath,
                createdAt: serverTimestamp()
            });
            Swal.fire('Success', 'Prescription uploaded successfully.', 'success');
            setPrescriptionText('');
            setPrescriptionFile(null);
        } catch (error) {
            console.error('Prescription upload error:', error);
            Swal.fire('Error', 'Failed to upload prescription.', 'error');
        } finally {
            setUploadingPrescription(false);
        }
    };

    const handleDownload = (fileURL) => window.open(fileURL, '_blank');

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            const appointmentRef = doc(db, 'appointments', appointmentId);
            await updateDoc(appointmentRef, { status: newStatus });
            setAppointment((prev) => ({ ...prev, status: newStatus }));
            Swal.fire('Success', `Appointment marked as ${newStatus}.`, 'success');
        } catch (error) {
            console.error('Status update error:', error);
            Swal.fire('Error', 'Failed to update status.', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const openChat = () => {
        if (appointment) {
            if (openChatWindow) {
                openChatWindow(appointment.id, appointment);
            } else {
                Swal.fire('Chat Not Available', 'Chat service is not connected in this context.', 'warning');
            }
        } else {
            Swal.fire('Oops!', 'Appointment details not loaded yet.', 'warning');
        }
      };

    if (loadingAppointment) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p>Loading appointment details...</p>
            </div>
        );
    }

    if (!appointment) {
        return <div className="text-center">No appointment found.</div>;
    }

    return (
        <div className="container my-4">
            <h2 className="mb-4 text-center" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
                Patient Details
            </h2>

            <div className="mt-3 mb-4 d-flex" style={{ justifyContent: 'end', gap: '10px' }}>
                <Button
                    variant="outline-success"
                    className="rounded-pill shadow-sm px-3 me-2"
                    onClick={() => setShowChat(true)}
                >
                    💬 Real-time Chat
                </Button>

                <Button
                    variant="outline-primary"
                    className="rounded-pill shadow-sm px-3"
                    onClick={() => window.open(`https://meet.jit.si/MediConnect_${appointment.fullName}`, '_blank')}
                >
                    📹 Start Video Call
                </Button>
            </div>


            <Row className="g-4 align-items-stretch">
                {/* Patient Information */}
                <Col md={6}>
                    <Card className="shadow-sm border-0 rounded-3 h-100">
                        <Card.Body>
                            <Card.Title>Patient Information</Card.Title>
                            <hr />
                            <p><strong>Name:</strong> {appointment.fullName}</p>
                            <p><strong>Patient Code:</strong> {appointment.patientCode || 'N/A'}</p>
                            <p><strong>Age:</strong> {appointment.age}</p>
                            <p><strong>Gender:</strong> {appointment.gender}</p>
                            <p><strong>Blood Group:</strong> {appointment.bloodGroup}</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Appointment & Doctor Information */}
                <Col md={6}>
                    <Card className="shadow-sm border-0 rounded-3 h-100">
                        <Card.Body>
                            <Card.Title>Appointment Information</Card.Title>
                            <hr />
                            <p><strong>Doctor:</strong> Dr. {appointment.doctor}</p>
                            <p><strong>Date:</strong> {appointment.appointmentDate}</p>
                            <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                            <p><strong>Reason for Visit:</strong> {appointment.reasonForVisit}</p>
                            <p><strong>Consultation Type:</strong> {appointment.consultationType}</p>
                            <p>
                                <strong>Status:</strong>{' '}
                                <span className={`badge bg-${appointment.status === 'Completed' ? 'success' : appointment.status === 'Cancelled' ? 'danger' : appointment.status === 'Pending' ? 'warning' : 'primary'}`}>
                                    {appointment.status}
                                </span>
                            </p>

                        </Card.Body>
                    </Card>
                </Col>

                {/* Contact Information */}
                <Col md={6}>
                    <Card className="shadow-sm border-0 rounded-3 h-100">
                        <Card.Body>
                            <Card.Title>Contact Information</Card.Title>
                            <hr />
                            <p><strong>Email:</strong> {appointment.email}</p>
                            <p><strong>Phone:</strong> {appointment.phone}</p>
                            <p><strong>Address:</strong> {appointment.address}</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Medical Reports */}
                <Col md={12}>
                    <Card className="shadow-sm border-0 rounded-3 position-relative">
                        <Card.Body>
                            <Card.Title>Medical Reports</Card.Title>
                            <hr />
                            {loadingReports ? (
                                <div className="text-center">
                                    <Spinner animation="border" variant="primary" />
                                    <p>Loading reports...</p>
                                </div>
                            ) : medicalReports.length === 0 ? (
                                <div className="empty-state text-center">
                                    <FaFileMedical size={50} className="icon completed" />
                                    <h5>No Medical Reports found</h5>
                                    <p>no reports uploaded yet.</p>
                                </div>
                            ) : (
                                medicalReports.map(({ fileURL, reportTitle, uploadedAt }, i) => {
                                    const uploadedDate = uploadedAt?.toDate ? uploadedAt.toDate() : new Date(uploadedAt);
                                    const pathname = new URL(fileURL).pathname;
                                    const fileExtension = pathname.split('.').pop().toLowerCase();
                                    const isPDF = fileExtension === 'pdf';
                                    return (
                                        <Card key={i} className="mb-3 shadow-sm border-0 rounded-3">
                                            <Card.Body className="d-flex align-items-center">
                                                <div className="me-3">
                                                    {isPDF ? <FaFilePdf size={35} color="#d9534f" /> : <FaFileImage size={35} color="#5bc0de" />}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <Card.Title>{reportTitle}</Card.Title>
                                                    <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                                                        Uploaded on: {uploadedDate.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Button variant="outline-primary" onClick={() => handleDownload(fileURL)}>
                                                        <FaDownload className="me-1" /> Download
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    );
                                })
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Prescriptions */}
                <Col md={12}>
                    <Card className="shadow-sm border-0 rounded-3 position-relative">
                        <Card.Body>
                            <Card.Title>Prescriptions</Card.Title>
                            <hr />
                            {loadingPrescriptions ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" variant="primary" />
                                    <p>Loading prescriptions...</p>
                                </div>
                            ) : appointment.prescriptions && appointment.prescriptions.length > 0 ? (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: '1rem',
                                    }}
                                >
                                    {appointment.prescriptions.map((prescription, index) => (
                                        <div
                                            key={index}
                                            className="shadow-sm p-3 rounded"
                                            style={{ background: '#fafafa', border: '1px solid #ddd' }}
                                        >
                                            <p><strong>Notes:</strong> {prescription.prescriptionText || 'N/A'}</p>

                                            {prescription.fileURL && (
                                                <>
                                                    <p style={{ wordBreak: 'break-all' }}>
                                                        <strong>File:</strong> {prescription.fileName}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-success"
                                                        className="rounded-pill px-3 shadow-sm"
                                                        onClick={() => handleDownload(prescription.fileURL)}
                                                    >
                                                        📥 Download
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state text-center py-4">
                                    <FaFileMedical size={50} className="text-secondary mb-3" />
                                    <h5 className="text-muted">No Prescriptions found</h5>
                                    <p className="text-secondary">No prescriptions uploaded for this appointment.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>


                {/* Prescription Upload Form */}
                <Col md={12}>
                    <Card className="shadow-sm border-0 rounded-3 mt-4">
                        <Card.Body>
                            <Card.Title>Add Prescription</Card.Title>
                            <hr />
                            <textarea
                                className="form-control mb-3"
                                rows="3"
                                placeholder="Enter prescription notes..."
                                value={prescriptionText}
                                onChange={(e) => setPrescriptionText(e.target.value)}
                            />

                            <input
                                type="file"
                                className="form-control mb-3"
                                accept="image/*,application/pdf"
                                onChange={(e) => setPrescriptionFile(e.target.files[0])}
                            />

                            <Button
                                variant="primary"
                                className="rounded-pill shadow-sm px-4"
                                onClick={handlePrescriptionSubmit}
                                disabled={uploadingPrescription}
                            >
                                {uploadingPrescription ? <Spinner as="span" animation="border" size="sm" /> : '📤 Upload Prescription'}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>


                {/* Status Update */}
                <Col md={12}>
                    <Card className="shadow-sm border-0 rounded-3 mt-4 text-center">
                        <Card.Body>
                            <Card.Title>Update Appointment Status</Card.Title>
                            <hr />
                            <div className="d-flex justify-content-center gap-3">
                                <Button
                                    variant="outline-success"
                                    className="shadow-sm px-4 me-2"
                                    onClick={() => handleStatusUpdate('Completed')}
                                    disabled={
                                        updatingStatus ||
                                        appointment.status === 'Completed' ||
                                        appointment.status === 'Cancelled'
                                    }
                                >
                                    {updatingStatus ? (
                                        <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                        '✅ Mark as Completed'
                                    )}
                                </Button>

                                <Button
                                    variant="outline-danger"
                                    className="shadow-sm px-4 me-2"
                                    onClick={() => handleStatusUpdate('Cancelled')}
                                    disabled={
                                        updatingStatus ||
                                        appointment.status === 'Completed' ||
                                        appointment.status === 'Cancelled'
                                    }
                                >
                                    {updatingStatus ? (
                                        <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                        '❌ Cancel Appointment'
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>

            {showChat && (
            <ChatWindow
                appointmentId={appointmentId}
                otherPartyLabel={appointment.fullName}
                otherPartyName={appointment.fullName}
                onClose={() => setShowChat(false)}
            />
            )}

        </div>
    );
}

export default PatientDetails;
