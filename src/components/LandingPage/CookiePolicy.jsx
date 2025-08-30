import React from "react";
import "./Policies.css";
import NavigationBar from "../Common/Navbar";
import Footer from "../LandingPage/Footer";

const CookiePolicy = () => {
    return (
        <>
            <NavigationBar />
            <div className="policy-container">
                <h2 className="policy-title">Cookie Policy</h2>
                <p>
                    At <strong>MediConnect Hospital</strong>, we use cookies and similar
                    technologies to enhance your browsing experience, provide personalized
                    services, and analyze system usage. This Cookie Policy explains how and
                    why we use cookies on our Hospital Appointment Booking System.
                </p>

                <h4>What Are Cookies?</h4>
                <p>
                    Cookies are small text files that are stored on your device when you
                    visit a website. They help us recognize your preferences, improve
                    performance, and deliver a smoother user experience.
                </p>

                <h4>Types of Cookies We Use</h4>
                <ul>
                    <li>
                        <strong>Essential Cookies:</strong> Required for secure login,
                        account authentication, and ensuring system security.
                    </li>
                    <li>
                        <strong>Analytics Cookies:</strong> Help us monitor website traffic,
                        appointment booking trends, and system performance.
                    </li>
                    <li>
                        <strong>Preference Cookies:</strong> Store your language, role, and
                        personalization settings for future visits.
                    </li>
                    <li>
                        <strong>Functional Cookies:</strong> Enable features like chat
                        support, notifications, and saving form inputs.
                    </li>
                    <li>
                        <strong>Advertising/Third-Party Cookies:</strong> May be used for
                        showing relevant healthcare promotions or reminders, if applicable.
                    </li>
                </ul>

                <h4>Why We Use Cookies</h4>
                <ul>
                    <li>To provide a secure and reliable appointment booking system.</li>
                    <li>To analyze usage patterns and improve hospital services.</li>
                    <li>To remember your login session and user preferences.</li>
                    <li>To personalize reminders, notifications, and patient experience.</li>
                </ul>

                <h4>Managing Cookies</h4>
                <p>
                    You can manage or disable cookies through your browser settings. Please
                    note that disabling essential cookies may limit certain features such as
                    appointment booking, patient dashboard access, or secure login.
                </p>

                <h4>Changes to This Policy</h4>
                <p>
                    We may update this Cookie Policy from time to time to reflect changes
                    in technology or legal requirements. Updates will be posted on this
                    page, and we encourage you to review it periodically.
                </p>

                <p className="policy-footer">
                    If you have any questions about our Cookie Policy, contact us at{" "}
                    <a href="mailto:support@mediconnect.com">support@mediconnect.com</a>.
                </p>
            </div>
            <Footer />
        </>
    );
};

export default CookiePolicy;
