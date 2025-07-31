import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { BsCalendar3, BsClock } from "react-icons/bs";
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import './BookAppointment.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function generatePatientCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BookAppointment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
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
    const [availableTimes, setAvailableTimes] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDoctorAvailability, setSelectedDoctorAvailability] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'doctors'));
                const doctorList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDoctors(doctorList);

                const saved = sessionStorage.getItem('appointmentFormData');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setFormData(parsed);
                    const selectedDoc = doctorList.find(d => d.id === parsed.doctor);
                    if (selectedDoc) {
                        setSelectedSpecialization(selectedDoc.specialization);
                        setSelectedDoctorAvailability(formatAvailabilityText(selectedDoc.availability));
                        calculateAvailableDatesAndTimes(selectedDoc);
                    }
                }
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };

        fetchDoctors();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('paymentSuccess') === 'true') sessionStorage.removeItem('appointmentFormData');
    }, []);

    const formatAvailabilityText = (availabilityObj) => {
        if (typeof availabilityObj !== 'object' || availabilityObj === null) return 'No availability set';

        const slots = dayOrder
            .filter((day) => availabilityObj[day]?.enabled)
            .map((day) => {
                const { start, end } = availabilityObj[day];
                return `${day.slice(0, 3)}: ${formatTime(start)} - ${formatTime(end)}`;
            });

        return slots.length > 0 ? slots.join(' | ') : 'No availability set';
    };

    const formatTime = (timeStr) => {
        const [hour, minute] = timeStr.split(':');
        const h = parseInt(hour, 10);
        const period = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minute} ${period}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'doctor') {
            const selectedDoctor = doctors.find((doc) => doc.id === value);
            if (selectedDoctor) {
                setSelectedSpecialization(selectedDoctor.specialization);
                const formattedAvailability = formatAvailabilityText(selectedDoctor.availability);
                setSelectedDoctorAvailability(formattedAvailability);
                setFormData(prev => ({
                    ...prev,
                    doctor: value,
                    specialization: selectedDoctor.specialization
                }));
                calculateAvailableDatesAndTimes(selectedDoctor);
            }
        }
    };

    const calculateAvailableDatesAndTimes = (selectedDoctor, selectedDate) => {
        const availability = selectedDoctor.availability;

        if (!availability || typeof availability !== 'object') {
            setAvailableTimes([]);
            setAvailableDates([]);
            return;
        }

        const today = new Date();
        const validDates = [];

        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (availability[dayName]?.enabled) {
                validDates.push(date.toISOString().split('T')[0]);
            }
        }

        setAvailableDates(validDates);

        if (selectedDate) {
            const date = new Date(selectedDate);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dayAvailability = availability[dayName];
            if (dayAvailability && dayAvailability.enabled) {
                const slots = generateTimeSlots(dayAvailability.start, dayAvailability.end);
                setAvailableTimes(slots);
            } else {
                setAvailableTimes([]);
            }
        }
    };

    const generateTimeSlots = (start, end) => {
        const slots = [];
        let [startHour, startMin] = start.split(':').map(Number);
        let [endHour, endMin] = end.split(':').map(Number);

        let current = new Date();
        current.setHours(startHour, startMin, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMin, 0, 0);

        while (current < endTime) {
            const time = current.toTimeString().slice(0, 5);
            slots.push(time);
            current.setMinutes(current.getMinutes() + 30);
        }

        return slots;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = ['fullName', 'email', 'phone', 'gender', 'address', 'doctor', 'specialization', 'appointmentDate', 'appointmentTime', 'consultationType', 'location'];
        for (let field of requiredFields) {
            if (!formData[field]) return alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1')}`);
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return alert('You must be logged in to book.');

            setIsLoading(true);
            const selectedDoctor = doctors.find(d => d.id === formData.doctor);
            if (!selectedDoctor) return alert('Doctor not found');

            const patientCode = generatePatientCode();
            const appointmentData = {
                ...formData,
                doctor: selectedDoctor.fullName || selectedDoctor.name,
                doctorId: selectedDoctor.id,
                specialization: selectedDoctor.specialization,
                patientCode,
                bookedBy: user.uid,
                status: 'Pending Payment',
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
            sessionStorage.setItem('appointmentFormData', JSON.stringify(appointmentData));
            navigate('/patient/bookAppointment/PaymentPage', {
                state: { consultationType: formData.consultationType, appointmentId: docRef.id },
            });
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Booking failed. Try again.');
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
                                    type="number"
                                    placeholder="Age"
                                    name="age"
                                    value={formData.age}
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
                            <Form.Select name="doctor"
                                value={formData.doctor}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Doctor</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.name} — {doc.specialization}
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

                    {selectedDoctorAvailability && (
                        <Row className="mb-3">
                            <Col>
                                <div className="availability-info text-success">
                                    🗓️ <strong>Availability:</strong> {selectedDoctorAvailability}
                                </div>
                            </Col>
                        </Row>
                    )}

                    <Row className="mb-3 align-items-center">
                        {/* Date Picker */}
                        <Col md={6} className="mb-3 position-relative">
                            <label htmlFor="appointmentDate" className="form-label d-block">Select Date</label>
                            <div className="input-group">
                                {/* Calendar Icon */}
                                <span className="input-group-text bg-light">
                                    <BsCalendar3 className="text-primary fs-5" />
                                </span>
                                <DatePicker
                                    id="appointmentDate"
                                    selected={formData.appointmentDate ? new Date(formData.appointmentDate) : null}
                                    onChange={(date) => {
                                        const formatted = date.toISOString().split("T")[0];
                                        setFormData(prev => ({ ...prev, appointmentDate: formatted }));
                                        const selectedDoc = doctors.find(d => d.id === formData.doctor);
                                        if (selectedDoc) calculateAvailableDatesAndTimes(selectedDoc, formatted);
                                    }}
                                    includeDates={availableDates.map(date => new Date(date))}
                                    dateFormat="EEEE, MMMM d, yyyy"
                                    placeholderText="Select Date"
                                    className="form-control"
                                />
                            </div>
                        </Col>

                        {/* Time Picker */}
                        <Col md={6} className="mb-3 position-relative">
                            <label htmlFor="appointmentTime" className="form-label d-block">Select Time</label>
                            <div className="input-group">
                                {/* Clock Icon */}
                                <span className="input-group-text bg-light">
                                    <BsClock className="text-success fs-5" />
                                </span>
                                <Form.Select
                                    id="appointmentTime"
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Time</option>
                                    {availableTimes.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </Form.Select>
                            </div>
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
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Select
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Location</option>
                                <option value="N/A">N/A</option>
                                <option value="Kukatpally">Kukatpally</option>
                                <option value="Miyapur">Miyapur</option>
                                <option value="Gachibowli">Gachibowli</option>
                                <option value="Mehdipatnam">Mehdipatnam</option>
                                <option value="Ameerpet">Ameerpet</option>
                                <option value="Secunderabad">Secunderabad</option>
                                <option value="Hitech City">Hitech City</option>
                                <option value="Dilsukhnagar">Dilsukhnagar</option>
                                <option value="LB Nagar">LB Nagar</option>
                                <option value="Somajiguda">Somajiguda</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-center mt-3">
                        <Button
                            onClick={handleSubmit}
                            variant="success"
                            className="confirm-btn px-4 py-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            ) : 'Confirm Appointment'}
                        </Button>
                    </div>

                </Form>
            </Card>
        </div>
    );
};

export default BookAppointment;
