import React from "react";
import "./Policies.css";
import NavigationBar from "../Common/Navbar";
import Footer from "../LandingPage/Footer";

const Disclaimer = () => {
    return (
        <>
            <NavigationBar />
            <div className="policy-container">
                <h2 className="policy-title">Disclaimer</h2>

                <p>
                    The MediConnect Hospital Appointment Booking System is designed to
                    simplify the scheduling of appointments and provide information about
                    our healthcare services. However, the information available through
                    this platform is for general convenience only and should not be
                    treated as a substitute for professional medical advice, diagnosis, or
                    treatment.
                </p>

                <h4>Medical Disclaimer</h4>
                <ul>
                    <li>
                        Always consult a qualified healthcare professional for diagnosis,
                        prescriptions, and treatment options.
                    </li>
                    <li>
                        The system cannot and should not be used for emergency medical
                        situations. In case of a medical emergency, please call your local
                        emergency number or visit the nearest hospital immediately.
                    </li>
                </ul>

                <h4>Information Accuracy</h4>
                <ul>
                    <li>
                        While we strive to keep doctor schedules, availability, and
                        service details updated, MediConnect cannot guarantee absolute
                        accuracy at all times.
                    </li>
                    <li>
                        Appointment confirmations and availability may change due to
                        unforeseen circumstances such as emergencies or technical issues.
                    </li>
                </ul>

                <h4>Limitation of Liability</h4>
                <ul>
                    <li>
                        MediConnect Hospital will not be responsible for any damages,
                        losses, or inconveniences caused due to reliance on the
                        information provided by this system.
                    </li>
                    <li>
                        We are not liable for delays, cancellations, or disruptions due to
                        technical errors, internet issues, or third-party services.
                    </li>
                </ul>

                <h4>Third-Party Content</h4>
                <p>
                    Our system may contain links to third-party websites for convenience.
                    MediConnect Hospital does not control or endorse the content of such
                    external sites and is not responsible for their practices or
                    policies.
                </p>

                <p className="policy-footer">
                    By using the MediConnect Hospital Appointment Booking System, you
                    acknowledge that you have read and understood this disclaimer and
                    agree to its terms.
                </p>
            </div>
            <Footer />
        </>
    );
};

export default Disclaimer;
