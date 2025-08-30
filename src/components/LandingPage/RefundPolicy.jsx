import React from "react";
import "./Policies.css";
import NavigationBar from "../Common/Navbar";
import Footer from "../LandingPage/Footer";

const RefundPolicy = () => {
    return (
        <>
            <NavigationBar />
            <div className="policy-container">
                <h2 className="policy-title">Refund Policy</h2>
                <p>
                    At <strong>MediConnect Hospital</strong>, we aim to provide patients with
                    a seamless and transparent healthcare booking experience. This Refund
                    Policy outlines the conditions under which refunds may be issued for
                    appointments, consultations, and other paid services.
                </p>

                <h4>1. Eligibility for Refund</h4>
                <ul>
                    <li>Appointment canceled at least <strong>24 hours before</strong> the scheduled time.</li>
                    <li>Doctor is unavailable due to emergencies or hospital cancellation.</li>
                    <li>Duplicate payments made for the same appointment.</li>
                    <li>Technical/payment gateway errors resulting in unsuccessful booking.</li>
                </ul>

                <h4>2. Non-Refundable Cases</h4>
                <ul>
                    <li>Cancellations made <strong>less than 24 hours</strong> before the appointment.</li>
                    <li>If the consultation or service has already been availed (even partially).</li>
                    <li>No-shows without prior cancellation.</li>
                    <li>Services provided under promotional or discounted packages.</li>
                </ul>

                <h4>3. Partial Refunds</h4>
                <p>
                    In some cases, patients may be eligible for a <strong>partial refund</strong>
                    if services have been initiated but not fully provided. The decision will
                    be based on the extent of services already delivered.
                </p>

                <h4>4. Refund Processing Time</h4>
                <p>
                    Refunds will be processed within <strong>7–10 business days</strong> from
                    the date of approval. The amount will be credited back to the original
                    payment method used at the time of booking. Please note that:
                </p>
                <ul>
                    <li>Processing time may vary depending on the bank/payment provider.</li>
                    <li>Any transaction or convenience charges by the payment gateway are <strong>non-refundable</strong>.</li>
                </ul>

                <h4>5. Special Cases</h4>
                <ul>
                    <li>
                        In case of prepaid packages (health checkups, wellness plans), refund
                        requests will only be considered before the first service is availed.
                    </li>
                    <li>
                        For surgeries or inpatient bookings, a separate hospital cancellation
                        and refund policy will apply.
                    </li>
                </ul>

                <h4>6. Contact for Refunds</h4>
                <p>
                    To request a refund, please contact our support team with your booking
                    details:
                </p>
                <p>
                    📧 Email: <a href="mailto:support@mediconnect.com">support@mediconnect.com</a> <br />
                    ☎️ Phone: +91-83747-45738
                </p>

                <p className="policy-footer">
                    This Refund Policy is subject to change without prior notice. We
                    encourage patients to review it periodically. By booking an appointment
                    through our system, you agree to the terms outlined above.
                </p>
            </div>
            <Footer />
        </>
    );
};

export default RefundPolicy;
