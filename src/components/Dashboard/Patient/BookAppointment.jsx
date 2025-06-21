import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import './BookAppointment.css';


export function generatePatientCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const BookAppointment = () => {
    // State to manage loading state
    const [isLoading, setIsLoading] = useState(false);
    
    // State to hold form data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        age: '',
        gender: '',
        bloodGroup: '',
        address: '',
        reasonForVisit: '',
        doctor: '',
        specialization: '',
        appointmentDate: '',
        appointmentTime: '',
        consultationType: '',
        location: '',
    });

    const [doctors, setDoctors] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'doctors'));
                const doctorList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDoctors(doctorList);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };

        fetchDoctors();

        // Load saved form data from sessionStorage
        const savedFormData = sessionStorage.getItem('appointmentFormData');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }

    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'doctor') {
            const selectedDoc = doctors.find((d) => d.id === value);
            setSelectedSpecialization(selectedDoc ? selectedDoc.specialization : '');

            setFormData((prev) => ({
                ...prev,
                doctor: value,
                specialization: selectedDoc ? selectedDoc.specialization : '',
            }));
        }

        if (name === 'dob') {
            calculateAge(value);
        }
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        setFormData((prev) => ({
            ...prev,
            age: age,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = [
            'fullName',
            'email',
            'phone',
            'dob',
            'gender',
            'address',
            'doctor',
            'specialization',
            'appointmentDate',
            'appointmentTime',
            'consultationType',
            'location',
        ];

        for (let field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1')}`);
                return;
            }
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert('You must be logged in to book an appointment.');
                return;
            }

            setIsLoading(true);
            const selectedDoctor = doctors.find(d => d.id === formData.doctor);
            if (!selectedDoctor) {
                alert('Selected doctor not found.');
                return;
            }

            const patientCode = generatePatientCode();

            const appointmentData = {
                ...formData,
                doctor: selectedDoctor.fullName,  // ← ✅ use name here
                patientCode: patientCode,
                bookedBy: user.uid,
                doctorId: selectedDoctor.id,       // ← keep doc id here
                status: 'Pending Payment',
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'appointments'), appointmentData);

            console.log('Appointment booked with ID:', docRef.id);

            sessionStorage.setItem('appointmentFormData', JSON.stringify(formData)); // Save form data to sessionStorage

            navigate('/patient/bookAppointment/PaymentPage', {
                state: {
                    consultationType: formData.consultationType,
                    appointmentId: docRef.id,
                },
            });
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Error booking appointment. Please try again.');
        } finally {
            setIsLoading(false);
          }
    };

    return (
        <div className="appointment-wrapper">
            <Card className="p-4 shadow appointment-card">
                <h2 className="text-center mb-5">Hospital Appointment Booking</h2>
                <Form onSubmit={handleSubmit}>
                    <h5>Patient Details</h5>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="d-flex">
                                <Form.Control
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                />
                                <Form.Control
                                    type="number"
                                    placeholder="Age"
                                    name="age"
                                    value={formData.age}
                                    disabled
                                    className="ms-2"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="N/A">Not Applicable</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Reason for Visit"
                                    name="reasonForVisit"
                                    value={formData.reasonForVisit}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h5 className="mt-4">Appointment Details</h5>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Select
                                name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.fullName} — {doc.specialization}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    value={selectedSpecialization}
                                    disabled
                                    placeholder="Specialization"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="time"
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Select
                                    name="consultationType"
                                    value={formData.consultationType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Consultation Type</option>
                                    <option value="In-Person">In-Person</option>
                                    <option value="Video-Call">Video-Call</option>
                                    <option value="Home Visit">Home Visit</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Location for Visit"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button onClick={handleSubmit} variant="success" className="w-50 mx-auto d-block" disabled={isLoading}>
                        {isLoading ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        ) : 'Confirm Appointment'}
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default BookAppointment;
