import React, { useState, useEffect, useCallback } from 'react';
import {
    FaFilePdf, FaFileImage, FaDownload, FaTrash, FaSortAlphaDown, FaSortAlphaUp, FaSortAmountDownAlt, FaCalendarTimes
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Spinner, Card, Button, Modal, Form } from 'react-bootstrap';
import { db, storage } from '../../../firebase/firebaseConfig';
import {
    collection, addDoc, getDocs, getDoc, doc, query, where, updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';
import './PatientMedicalReports.css';

function PatientMedicalReports() {
    const [appointments, setAppointments] = useState([]);
    const [medicalReports, setMedicalReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [sortOption, setSortOption] = useState('latest');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFiles, setSelectedFiles] = useState(null);

    const reportsPerPage = 6;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    const fetchAppointmentsAndReports = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const appointmentsRef = collection(db, 'appointments');
            const apptQuery = query(appointmentsRef, where('bookedBy', '==', currentUser.uid));
            const apptSnap = await getDocs(apptQuery);
            const fetchedAppointments = apptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(fetchedAppointments);

            const reportsRef = collection(db, 'medicalReports');
            const reportsSnap = await getDocs(reportsRef);
            const fetchedReports = reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMedicalReports(fetchedReports);

        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire('Error', 'Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchAppointmentsAndReports();
    }, [fetchAppointmentsAndReports]);

    const handleFileUpload = async (files) => {
        if (!selectedAppointment) {
            Swal.fire('Please select an appointment.');
            return;
        }

        if (!selectedFiles || !selectedFiles.length) {
            Swal.fire('Please select file(s) to upload.');
            return;
        }

        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        const validFiles = Array.from(selectedFiles).filter(file => allowedTypes.includes(file.type));

        if (!validFiles.length) {
            Swal.fire('Only pdf, png, jpg files allowed.');
            return;
        }

        setUploading(true);
        try {
            const reportsRef = collection(db, 'medicalReports');
            const q = query(reportsRef, where('appointmentId', '==', selectedAppointment));
            const querySnap = await getDocs(q);

            let reportDocId = null;
            let existingFiles = [];

            if (!querySnap.empty) {
                reportDocId = querySnap.docs[0].id;
                existingFiles = querySnap.docs[0].data().files || [];
            }

            const newFiles = [];

            for (const file of validFiles) {
                const uniqueFileName = `${uuidv4()}_${file.name}`;
                const fileRef = ref(storage, `medicalReports/${selectedAppointment}/${uniqueFileName}`);
                await uploadBytes(fileRef, file);
                const downloadURL = await getDownloadURL(fileRef);

                newFiles.push({
                    reportTitle: file.name,
                    fileURL: downloadURL,
                    uploadedAt: new Date(),
                    uploadedBy: currentUser.uid,
                    storagePath: fileRef.fullPath,
                });
            }

            if (reportDocId) {
                const reportDocRef = doc(db, 'medicalReports', reportDocId);
                await updateDoc(reportDocRef, {
                    files: [...existingFiles, ...newFiles],
                });
            } else {
                await addDoc(reportsRef, {
                    appointmentId: selectedAppointment,
                    patientId: currentUser.uid,
                    createdAt: new Date(),
                    createdBy: currentUser.uid,
                    files: newFiles,
                });
            }

            await fetchAppointmentsAndReports();
            Swal.fire('Success', 'File(s) uploaded.', 'success');
        } catch (err) {
            console.error('Upload error:', err);
            Swal.fire('Error', 'Failed to upload file(s)', 'error');
        } finally {
            setUploading(false);
            setShowModal(false);
            setSelectedAppointment('');
            setSelectedFiles(null); // clear files
        }
    };

    const handleDelete = (reportDocId, storagePath) => {
        Swal.fire({
            title: 'Delete this report?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Fetch the report document directly using doc()
                    const reportDocRef = doc(db, 'medicalReports', reportDocId);
                    const reportSnap = await getDoc(reportDocRef);

                    if (!reportSnap.exists()) {
                        Swal.fire('Error', 'Report not found.', 'error');
                        return;
                    }

                    const existingFiles = reportSnap.data().files || [];

                    // Filter out the file to delete based on storagePath (reliable unique value)
                    const updatedFiles = existingFiles.filter(
                        (file) => file.storagePath !== storagePath
                    );

                    // Update the document with remaining files
                    await updateDoc(reportDocRef, { files: updatedFiles });

                    // Delete file from Storage
                    await deleteObject(ref(storage, storagePath));

                    // Refresh data
                    await fetchAppointmentsAndReports();

                    Swal.fire('Deleted!', 'Report deleted.', 'success');
                } catch (err) {
                    console.error('Delete error:', err);
                    Swal.fire('Error', 'Failed to delete report.', 'error');
                }
            }
        });
    };


    const groupedReports = medicalReports.reduce((groups, report) => {
        const appointment = appointments.find(a => a.id === report.appointmentId);
        if (appointment && report.files) {
            const key = `${appointment.fullName} (${appointment.patientCode || 'No Code'})`;
            if (!groups[key]) groups[key] = [];
            report.files.forEach(file => {
                groups[key].push({
                    ...file,
                    appointment,
                    reportDocId: report.id,
                });
            });
        }
        return groups;
    }, {});

    const sortedAndFilteredGroups = () => {
        const filterText = searchTerm.trim().toLowerCase();
        let entries = Object.entries(groupedReports)
            .map(([patientName, reports]) => {
                const filteredReports = reports.filter(
                    (r) =>
                        (patientName || '').toLowerCase().includes(filterText) ||
                        (r.reportTitle || '').toLowerCase().includes(filterText)
                );
                return filteredReports.length ? [patientName, filteredReports] : null;
            })
            .filter(Boolean);

        if (sortOption === 'latest') {
            entries = entries.map(([patientName, reports]) => [
                patientName,
                reports.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
            ]);
        } else if (sortOption === 'a-z') {
            entries.sort(([a], [b]) => a.localeCompare(b));
        } else if (sortOption === 'z-a') {
            entries.sort(([a], [b]) => b.localeCompare(a));
        }

        return entries;
    };

    const currentGroups = sortedAndFilteredGroups().slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
    );

    const totalPages = Math.ceil(sortedAndFilteredGroups().length / reportsPerPage);

    return (
        <div className="medical-reports-container">
            <h3 className="mb-4 text-center text-primary" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>Medical Reports</h3>
            {/* Top Controls */}
            <div className="top-controls mb-3 d-flex flex-wrap align-items-center gap-2">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="search-bar" style={{ minWidth: '250px', flexGrow: 1 }} />
                <Button disabled={!appointments.length || uploading} onClick={() => setShowModal(true)}>Upload Report</Button>
                <Button variant="outline-secondary" onClick={() => setSortOption(sortOption === 'latest' ? 'a-z' : sortOption === 'a-z' ? 'z-a' : 'latest')}>
                    {sortOption === 'latest' ? <FaSortAmountDownAlt /> : sortOption === 'a-z' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
                </Button>
            </div>

            {loading ? (
                <div className="text-center my-5"><Spinner animation="border" /></div>
            ) : currentGroups.length === 0 ? (
                <div className="empty-state">
                    <FaCalendarTimes size={40} className="icon prescriptions" />
                    <h5>No medical reports found</h5>
                    <p>No reports uploaded yet.</p>
                </div>
            ) : (
                currentGroups.map(([patientName, reports], idx) => (
                    <Card key={idx} className="mb-4 shadow-sm">
                        <Card.Header><strong>{patientName}</strong></Card.Header>
                        {reports.map((report, i) => {
                            const uploadedDate = report.uploadedAt?.toDate ? report.uploadedAt.toDate() : new Date(report.uploadedAt);
                            const isPdf = (report.reportTitle || '').toLowerCase().endsWith('.pdf');
                            const { doctor, specialization } = report.appointment;
                            return (
                                <Card.Body key={i} className="d-flex align-items-center">
                                    <div className="me-3">{isPdf ? <FaFilePdf size={35} color="#d9534f" /> : <FaFileImage size={35} color="#5bc0de" />}</div>
                                    <div className="flex-grow-1">
                                        <Card.Title>{report.reportTitle}</Card.Title>
                                        <Card.Text>
                                            Doctor: {doctor || 'N/A'} | Specialization: {specialization || 'N/A'}<br />
                                            {/* Appointment: {scheduledDate ? new Date(scheduledDate.seconds * 1000).toLocaleString() : 'N/A'}<br /> */}
                                            {/* Uploaded on: {uploadedDate.toLocaleString()} */}
                                            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                                                Uploaded on: {uploadedDate.toLocaleString()}
                                            </p>
                                        </Card.Text>
                                    </div>
                                    <div>
                                        <Button variant="outline-primary" href={report.fileURL} target="_blank"><FaDownload className="me-1" /> Download</Button>
                                        <Button variant="outline-danger" onClick={() => handleDelete(report.reportDocId, report.storagePath, i)} className="ms-2"><FaTrash /></Button>
                                    </div>
                                </Card.Body>
                            );
                        })}
                    </Card>
                ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination d-flex justify-content-center mt-3 gap-2 flex-wrap">
                    {Array.from({ length: totalPages }, (_, idx) => (
                        <button key={idx + 1} className={`page-btn ${currentPage === idx + 1 ? 'active-page' : ''}`} onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header>
                    <Modal.Title>Upload Medical Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!appointments.length ? (
                        <p>No appointments available.</p>
                    ) : (
                        <>
                            <Form.Select
                                onChange={(e) => setSelectedAppointment(e.target.value)}
                                value={selectedAppointment}
                                disabled={uploading}
                            >
                                <option value="">-- Select Appointment --</option>
                                {appointments
                                    .filter(
                                        (appt) =>
                                            ['Confirmed', 'Scheduled', 'Pending'].includes(appt.status)
                                    )
                                    .map((appt) => (
                                        <option key={appt.id} value={appt.id}>
                                            {appt.fullName} ({appt.patientCode || 'No Code'}) -{' '}
                                            {appt.appointmentDate
                                                ? new Date(
                                                    appt.appointmentDate.seconds
                                                        ? appt.appointmentDate.seconds * 1000
                                                        : typeof appt.appointmentDate === 'string'
                                                            ? new Date(appt.appointmentDate).getTime()
                                                            : 0
                                                ).toLocaleDateString()
                                                : 'Date N/A'}
                                        </option>
                                    ))}
                            </Form.Select>

                            <Form.Group controlId="formFileMultiple" className="mt-3">
                                <Form.Label>Select File(s)</Form.Label>
                                <Form.Control
                                    type="file"
                                    multiple
                                    accept=".pdf,image/png,image/jpeg"
                                    disabled={!selectedAppointment || uploading}
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={handleFileUpload}
                        disabled={!selectedAppointment || !selectedFiles?.length || uploading}
                    >
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

export default PatientMedicalReports;
