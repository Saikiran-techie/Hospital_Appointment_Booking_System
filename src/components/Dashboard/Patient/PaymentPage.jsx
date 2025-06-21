import React, { useEffect, useState } from 'react';
import { Button, Card, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { useLoading } from '../../../context/LoadingContext';
import './PaymentPage.css';

// Load Razorpay script dynamically
const loadRazorpayScript = () =>
    new Promise(resolve => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        document.body.appendChild(script);
    });

function PaymentPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { appointmentId } = state || {};
    const { setLoading } = useLoading();

    const [appointment, setAppointment] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    // Fetch appointment details on mount
    useEffect(() => {
        const fetchAppointment = async () => {
            if (!appointmentId) {
                Swal.fire('Error', 'Invalid appointment ID', 'error');
                navigate('/patient/dashboard');
                return;
            }
            try {
                const docRef = doc(db, 'appointments', appointmentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAppointment(docSnap.data());
                } else {
                    Swal.fire('Error', 'Appointment not found', 'error');
                    navigate('/patient/dashboard');
                }
            } catch (err) {
                Swal.fire('Error', 'Failed to load appointment', 'error');
                navigate('/patient/dashboard');
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchAppointment();
    }, [appointmentId, navigate]);

    const handlePayNow = async () => {
        const ok = await loadRazorpayScript();
        if (!ok) return Swal.fire('Oops!', 'Failed to load payment gateway. Try again.', 'error');

        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/create-razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 50000, currency: 'INR', receipt: appointmentId }),
            });
            const orderData = await res.json();
            if (!orderData.id) throw new Error('Order creation failed.');

            const options = {
                key: process.env.REACT_APP_RP_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Hospital Appointment',
                description: 'Consultation Fee',
                order_id: orderData.id,
                handler: async response => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Payment Success',
                        text: `Payment ID: ${response.razorpay_payment_id}`
                    }).then(() => saveAppointment(response.razorpay_payment_id));
                },
                prefill: {
                    name: appointment.fullName,
                    email: appointment.email,
                    contact: appointment.phone
                },
                theme: { color: '#28a745' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            rzp.on('payment.failed', () => Swal.fire('Payment Failed', '', 'error'));

        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Clear session storage to remove any previous appointment data
    sessionStorage.removeItem('appointmentFormData');

    // Function to save appointment details after successful payment
    const saveAppointment = async paymentId => {
        try {
            setLoading(true);
            const ref = doc(db, 'appointments', appointmentId);
            await updateDoc(ref, {
                paymentMethod: 'Online',
                paymentId,
                status: 'Confirmed',
                paymentTimestamp: new Date()
            });
            Swal.fire({ icon: 'success', title: 'Appointment Confirmed' }).then(() =>
                navigate('/patient/dashboard')
            );
        } catch (e) {
            Swal.fire('Error', 'Unable to confirm appointment', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingDetails) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="payment-container d-flex justify-content-center align-items-center" style={{ minHeight: '65vh', background: '#f0f2f5' }}>
            <Card className="shadow-lg" style={{ width: '550px' }}>
                <Card.Body>
                    <h3 className="text-center mb-4">Confirm Payment</h3>
                    <p className="text-muted text-center mb-4">Please review your appointment details before proceeding with the payment.</p>
                    <hr />
                    <p><strong>Patient:</strong> {appointment.fullName} ({appointment.patientCode})</p>
                    {/* <p><strong>Appointment ID:</strong> {appointmentId}</p> */}
                    <p><strong>Doctor:</strong> Dr. {appointment.doctor}</p>
                    <p><strong>Specialization:</strong> {appointment.specialization}</p>
                    <p><strong>Date & Time:</strong> {appointment.appointmentDate} at {appointment.appointmentTime}</p>
                    <p><strong>Consultation Type:</strong> {appointment.consultationType}</p>
                    <p><strong>Consultation Fee:</strong> ₹500</p>
                    {/* <p><strong>Fee:</strong> ₹500</p> */}

                    <Button onClick={handlePayNow} className="w-100 mt-3" variant="primary">
                        Pay ₹500
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
}

export default PaymentPage;
