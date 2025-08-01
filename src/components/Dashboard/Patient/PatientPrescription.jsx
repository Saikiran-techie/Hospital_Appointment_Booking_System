import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { Spinner, Button } from "react-bootstrap";
import {
    FaSortAmountDown,
    FaSortAmountUp,
    FaFileMedical,
    FaNotesMedical,
    FaUserMd,
    FaDownload
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./PatientPrescription.css";
import { useAuth } from "../../../context/AuthContext";

function PatientPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortByDate, setSortByDate] = useState(true);
    const [loading, setLoading] = useState(true);

    const { currentUser } = useAuth();

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const appointmentsRef = collection(db, "appointments");
            const appointmentsQ = query(
                appointmentsRef,
                where("bookedBy", "==", currentUser.uid)
            );
            const appointmentsSnap = await getDocs(appointmentsQ);

            const appointmentData = {};
            appointmentsSnap.forEach((docSnap) => {
                appointmentData[docSnap.id] = docSnap.data();
            });

            const appointmentIds = Object.keys(appointmentData);
            if (appointmentIds.length === 0) {
                setPrescriptions([]);
                setLoading(false);
                return;
            }

            const prescriptionsRef = collection(db, "prescriptions");
            const prescriptionsQ = query(
                prescriptionsRef,
                where("appointmentId", "in", appointmentIds),
                orderBy("createdAt", "desc")
            );
            const prescriptionsSnap = await getDocs(prescriptionsQ);

            const fetchedPrescriptions = prescriptionsSnap.docs.map((docSnap) => {
                const data = docSnap.data();
                const appointmentInfo = appointmentData[data.appointmentId] || {};
                return {
                    id: docSnap.id,
                    ...data,
                    appointmentDetails: appointmentInfo,
                };
            });

            setPrescriptions(fetchedPrescriptions);
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            Swal.fire("Error", "Failed to fetch prescriptions", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSortToggle = () => {
        setSortByDate(!sortByDate);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDownload = (url) => {
        window.open(url, "_blank");
    };

    const groupedPrescriptions = prescriptions.reduce((groups, prescription) => {
        const appointmentId = prescription.appointmentId;
        if (!groups[appointmentId]) {
            groups[appointmentId] = [];
        }
        groups[appointmentId].push(prescription);
        return groups;
    }, {});

    const filteredSortedGroups = Object.entries(groupedPrescriptions)
        .filter(([_, prescriptions]) =>
            prescriptions.some((p) =>
                p.appointmentDetails?.fullName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
        )
        .sort((a, b) => {
            if (sortByDate) {
                const aDate = a[1][0]?.createdAt?.seconds || 0;
                const bDate = b[1][0]?.createdAt?.seconds || 0;
                return bDate - aDate;
            } else {
                const aName =
                    a[1][0]?.appointmentDetails?.fullName?.toLowerCase() || "";
                const bName =
                    b[1][0]?.appointmentDetails?.fullName?.toLowerCase() || "";
                return aName.localeCompare(bName);
            }
        });

    return (
        <div className="prescription-container">
            <h3 className="section-title text-primary">Patient Prescriptions</h3>

            <div className="search-sort-container">
                <input
                    type="text"
                    placeholder="Search by Patient Name"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <Button
                    variant="primary"
                    className="sort-btn"
                    onClick={handleSortToggle}
                >
                    {sortByDate ? <FaSortAmountDown /> : <FaSortAmountUp />} Sort by{" "}
                    {sortByDate ? "Date" : "Name"}
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading prescriptions...</p>
                </div>
            ) : filteredSortedGroups.length === 0 ? (
                <div className="text-center empty-state py-4">
                    <FaFileMedical size={50} className="text-secondary mb-3" />
                    <h5 className="text-muted">No Prescriptions found</h5>
                </div>
            ) : (
                filteredSortedGroups.map(([appointmentId, prescriptions]) => {
                    const appointment = prescriptions[0].appointmentDetails;
                    return (
                        <div key={appointmentId} className="appointment-card">
                            <h3>
                                {appointment.fullName}{" "}
                                <span className="patient-code">
                                    ({appointment.patientCode || "N/A"})
                                </span>
                            </h3>
                            <hr />
                            <p>
                                <FaUserMd /> <strong>Doctor:</strong> {appointment.doctor}
                            </p>
                            <p>
                                <strong>Specialization:</strong> {appointment.specialization}
                            </p>
                            <p>
                                <strong>Reason for Visit:</strong>{" "}
                                {appointment.reasonForVisit || "Not Provided"}
                            </p>
                            <p>
                                <strong>Status:</strong> {appointment.status}
                            </p>

                            <div className="prescription-list">
                                {prescriptions.map((prescription) => (
                                    <div key={prescription.id} className="prescription-card">
                                        <p>
                                            <FaNotesMedical /> <strong>Notes:</strong>{" "}
                                            {prescription.prescriptionText || "N/A"}
                                        </p>

                                        {prescription.fileURL && (
                                            <div className="file-section">
                                                <h5>File:</h5>
                                                {/* {prescription.fileURL.endsWith(".pdf") ? (
                                                    <embed
                                                        src={prescription.fileURL}
                                                        type="application/pdf"
                                                        width="100%"
                                                        height="300px"
                                                    />
                                                ) : (
                                                    <img
                                                        src={prescription.fileURL}
                                                        alt="Prescription"
                                                        className="prescription-image"
                                                    />
                                                )} */}
                                                <Button
                                                    size="sm"
                                                    variant="outline-success"
                                                    className="rounded-pill px-3 shadow-sm mt-2"
                                                    onClick={() => handleDownload(prescription.fileURL)}
                                                >
                                                    <FaDownload className="me-1" />
                                                    Download Prescription
                                                    
                                                </Button>
                                            </div>
                                        )}

                                        <p>
                                            <strong>Uploaded on:</strong>{" "}
                                            {prescription.createdAt
                                                ? new Date(
                                                    prescription.createdAt.seconds * 1000
                                                ).toLocaleDateString()
                                                : "Unknown"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default PatientPrescriptions;
