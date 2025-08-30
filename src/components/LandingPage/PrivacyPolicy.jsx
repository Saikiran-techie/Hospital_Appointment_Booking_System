import React from "react";
import "./Policies.css"; // Common styling for all policy pages
import NavigationBar from "../Common/Navbar";
import Footer from "../LandingPage/Footer";

const PrivacyPolicy = () => {
    return (
        <>
            <NavigationBar />
            <div className="policy-container">
                <h2 className="policy-title">Privacy Policy</h2>
                <p>
                    At <strong>MediConnect Hospital</strong>, your trust is important to us.
                    This Privacy Policy explains how we collect, use, store, and protect your
                    personal information while using our Hospital Appointment Booking System.
                </p>

                <h4>1. Information We Collect</h4>
                <ul>
                    <li>Personal details such as name, email address, phone number.</li>
                    <li>Medical and health-related information provided during appointments.</li>
                    <li>Login activity, usage behavior, and preferences.</li>
                    <li>Payment or billing details when applicable.</li>
                </ul>

                <h4>2. How We Use Your Information</h4>
                <ul>
                    <li>To schedule and manage your hospital appointments.</li>
                    <li>To provide accurate medical care and maintain patient records.</li>
                    <li>To send reminders, notifications, and updates.</li>
                    <li>To improve our hospital services and enhance patient experience.</li>
                </ul>

                <h4>3. Cookies and Tracking</h4>
                <p>
                    Our platform may use cookies to enhance your browsing experience and
                    analyze user behavior. You may disable cookies in your browser settings,
                    but some features may not function properly.
                </p>

                <h4>4. Data Protection & Security</h4>
                <p>
                    All personal data is stored securely in compliance with applicable
                    healthcare and data protection laws. We use encryption and secure servers
                    to safeguard your information.
                </p>

                <h4>5. Sharing of Information</h4>
                <p>
                    We do not sell or trade your personal data. Information may only be shared
                    with authorized medical professionals involved in your care, or as required
                    by law.
                </p>

                <h4>6. Your Rights</h4>
                <ul>
                    <li>Access your personal data at any time.</li>
                    <li>Request corrections to inaccurate information.</li>
                    <li>Withdraw consent for certain data uses.</li>
                    <li>Request deletion of your data, subject to legal obligations.</li>
                </ul>

                <h4>7. Updates to Policy</h4>
                <p>
                    We may update this Privacy Policy from time to time. All changes will be
                    posted on this page with an updated effective date.
                </p>

                <p className="policy-footer">
                    If you have questions or concerns about this policy, please contact us at{" "}
                    <a href="mailto:support@mediconnect.com">support@mediconnect.com</a>.
                </p>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
