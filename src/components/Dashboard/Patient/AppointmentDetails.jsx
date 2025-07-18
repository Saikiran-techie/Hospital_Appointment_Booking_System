import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import {
  doc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc
} from 'firebase/firestore';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { db, storage } from '../../../firebase/firebaseConfig';
import { Spinner, Card, Row, Col, Button } from 'react-bootstrap';
import { FaFileMedical, FaDownload, FaTrash, FaFilePrescription, FaFileImage, FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AppointmentDetails.css';
import ChatWindow from '../../ChatWindow/ChatWindow';

function AppointmentDetails() {
  const { id: paramId } = useParams();
  const {
    setChatAppointmentData,
    setChatAppointmentId
  } = useOutletContext();

  const id = paramId;

  const [appointmentData, setAppointmentData] = useState(null);
  const [medicalReports, setMedicalReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [deletingReportId, setDeletingReportId] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!id) {
      console.warn("No appointment id available — skipping fetch.");
      return;
    }

    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'appointments', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAppointmentData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('No appointment found!');
          setAppointmentData(null);
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setAppointmentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  useEffect(() => {
    if (!id) {
      setReportsLoading(false);
      setMedicalReports([]);
      setPrescriptionsLoading(false);
      setPrescriptions([]);
      return;
    }

    const fetchReports = async () => {
      setReportsLoading(true);
      try {
        const medicalReportsRef = collection(db, 'medicalReports');
        const reportsQuery = query(medicalReportsRef, where('appointmentId', '==', id));
        const snapshot = await getDocs(reportsQuery);

        const reports = snapshot.docs.flatMap((doc) =>
          (doc.data().files || []).map((file) => ({
            reportDocId: doc.id,
            ...file
          }))
        );

        setMedicalReports(reports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setMedicalReports([]);
      } finally {
        setReportsLoading(false);
      }
    };

    const fetchPrescriptions = async () => {
      setPrescriptionsLoading(true);
      try {
        const prescriptionsRef = collection(db, 'prescriptions');
        const prescriptionsQuery = query(prescriptionsRef, where('appointmentId', '==', id));
        const snapshot = await getDocs(prescriptionsQuery);
        const fetchedPrescriptions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPrescriptions(fetchedPrescriptions);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setPrescriptions([]);
      } finally {
        setPrescriptionsLoading(false);
      }
    };

    fetchReports();
    fetchPrescriptions();
  }, [id]);

  const downloadFile = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteReport = (reportDocId, storagePath) => {
    Swal.fire({
      title: 'Delete this report?',
      text: 'This will permanently delete the selected file.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingReportId(reportDocId);

          const reportDocRef = doc(db, 'medicalReports', reportDocId);
          const reportSnap = await getDoc(reportDocRef);
          if (!reportSnap.exists()) {
            Swal.fire('Error', 'Report not found.', 'error');
            return;
          }

          const existingFiles = reportSnap.data().files || [];
          const updatedFiles = existingFiles.filter(
            (file) => file.storagePath !== storagePath
          );

          await updateDoc(reportDocRef, { files: updatedFiles });

          const fileStorageRef = storageRef(storage, storagePath);
          await deleteObject(fileStorageRef);

          if (updatedFiles.length === 0) {
            await deleteDoc(reportDocRef);
          }

          setMedicalReports((prev) =>
            prev.filter((report) => !(report.reportDocId === reportDocId && report.storagePath === storagePath))
          );

          Swal.fire('Deleted!', 'The report has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting report file:', error);
          Swal.fire('Failed!', 'Could not delete the report.', 'error');
        } finally {
          setDeletingReportId(null);
        }
      }
    });
  };

  const openChat = () => {
    if (appointmentData) {
      setChatAppointmentData(appointmentData);
      setChatAppointmentId(appointmentData.id);
      setShowChat(true);
    } else {
      Swal.fire('Oops!', 'Appointment details not loaded yet.', 'warning');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading appointment details...</p>
      </div>
    );
  }

  if (!appointmentData) {
    return <p className="text-center mt-4">Appointment not found.</p>;
  }

  return (
    <div className="container my-4">
      <h3 className="mb-4 text-center" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '600' }}>
        Appointment Details
      </h3>

      <div className="mt-3 mb-4 d-flex" style={{ justifyContent: 'end', gap: '10px' }}>
        <Button
          variant="outline-success"
          className="rounded-pill shadow-sm px-3"
          onClick={() => setShowChat(true)}
        >
          💬 Real-time Chat
        </Button>

        <Button
          variant="outline-primary"
          className="rounded-pill shadow-sm px-3"
          onClick={() => window.open(`https://meet.jit.si/MediConnect_${appointmentData.fullName}`, '_blank')}
        >
          📹 Start Video Call
        </Button>
      </div>

      <Row className="g-4 align-items-stretch">
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body>
              <Card.Title>Patient Information</Card.Title>
              <hr />
              <p><strong>Name:</strong> {appointmentData.fullName} ({appointmentData.patientCode})</p>
              <p><strong>Gender:</strong> {appointmentData.gender}</p>
              <p><strong>Date of Birth:</strong> {appointmentData.dob}</p>
              <p><strong>Age:</strong> {appointmentData.age}</p>
              <p><strong>Blood Group:</strong> {appointmentData.bloodGroup}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body>
              <Card.Title>Appointment Information</Card.Title>
              <hr />
              <p><strong>Doctor:</strong> Dr. {appointmentData.doctor}</p>
              <p><strong>Specialization:</strong> {appointmentData.specialization}</p>
              <p><strong>Reason for Visit:</strong> {appointmentData.reasonForVisit}</p>
              <p><strong>Date & Time:</strong> {appointmentData.appointmentDate} at {appointmentData.appointmentTime}</p>
              <p><strong>Consultation Type:</strong> {appointmentData.consultationType}</p>
              {appointmentData.paymentId && <p><strong>Payment ID:</strong> {appointmentData.paymentId}</p>}
              <p>
                <strong>Status:</strong>
                <span className={`badge bg-${appointmentData.status === 'Completed' ? 'success' : appointmentData.status === 'Cancelled' ? 'danger' : appointmentData.status === 'Pending' ? 'warning' : 'primary'}`}>
                  {appointmentData.status}
                </span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* Medical Reports */}
        <Col md={12}>
          <Card className="shadow-sm border-0 rounded-3 position-relative">
            <Card.Body>
              <Card.Title>Medical Reports</Card.Title>
              <hr />
              {reportsLoading ? (
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
                medicalReports.map(({ reportDocId, fileURL, storagePath, reportTitle, uploadedAt }, i) => {
                  const uploadedDate = uploadedAt?.toDate ? uploadedAt.toDate() : new Date(uploadedAt);
                  const pathname = new URL(fileURL).pathname;
                  const fileExtension = pathname.split('.').pop().toLowerCase();
                  const isPDF = fileExtension === 'pdf';

                  return (
                    <Card key={i} className="mb-3 shadow-sm border-0 rounded-3">
                      <Card.Body className="d-flex align-items-center">
                        <div className="me-3">
                          {isPDF ? (
                            <FaFilePdf size={35} color="#d9534f" />
                          ) : (
                            <FaFileImage size={35} color="#5bc0de" />
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <Card.Title>{reportTitle}</Card.Title>
                          <Card.Text>
                            Doctor: {appointmentData?.doctor || 'N/A'} | Specialization: {appointmentData?.specialization || 'N/A'}
                            <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                              Uploaded on: {uploadedDate.toLocaleString()}
                            </p>
                          </Card.Text>
                        </div>
                        <div>
                          <Button variant="outline-primary" href={fileURL} target="_blank">
                            <FaDownload className="me-1" /> Download
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDeleteReport(reportDocId, storagePath)}
                            className="ms-2"
                          >
                            {deletingReportId === reportDocId ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FaTrash />
                            )}
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


        {/* ✅ Prescription Card: Only for Completed Appointments */}
        {appointmentData.status === 'Completed' && (
          <Col md={12}>
            <Card className="shadow-sm border-0 rounded-3 position-relative">
              <Card.Body>
                <Card.Title>Prescriptions</Card.Title>
                <hr />
                {prescriptionsLoading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading prescriptions...</p>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="empty-state text-center">
                    <FaFilePrescription size={50} className="icon completed" />
                    <h5>No Prescriptions found</h5>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-3">
                    {prescriptions.map(({ id, fileURL, prescriptionText, createdAt }) => {
                      const formattedDate = createdAt?.seconds
                        ? new Date(createdAt.seconds * 1000).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                        : createdAt || 'N/A';

                      return (
                        <div key={id} className="shadow-sm p-3 border rounded" style={{ width: '500px', background: '#fafafa' }}>
                          <p><strong>Notes:</strong> {prescriptionText || 'N/A'}</p>
                          {fileURL && (
                            <>
                              <p style={{ wordBreak: 'break-all' }}>
                                <strong>File:</strong>
                              </p>

                              <Button
                                size="sm"
                                variant="outline-success"
                                className="rounded-pill px-3 shadow-sm"
                                onClick={() => downloadFile(fileURL, `Prescription_${id}`)}
                              >
                                📥 Download
                              </Button>
                            </>

                          )}
                          <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                            Uploaded on: {formattedDate}
                          </p>
                        </div>
                      );
                    }
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {showChat && (
        <ChatWindow
          appointmentId={appointmentData.id}
          otherPartyLabel={`Dr. ${appointmentData.doctor}`}
          otherPartyName={appointmentData.doctor}
          onClose={() => setShowChat(false)}
        />
      )}

    </div>


  );
}

export default AppointmentDetails;
