import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import "../LandingPage/LandingPage.css";

// ✅ Import Firestore instance from your firebase.js
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!Object.values(formData).every(Boolean)) {
            toast.warn("Please fill in all fields!");
            return;
        }

        try {
            // ✅ Store message in Firestore
            await addDoc(collection(db, "contactMessages"), {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                createdAt: serverTimestamp(),
            });

            toast.success("Message sent successfully!");
            setFormData({ name: "", email: "", message: "" }); // Reset form

        } catch (error) {
            console.error("Error submitting message:", error);
            toast.error("Failed to send message. Please try again later.");
        }
    };

    return (
        <div className="contact-section py-5" id="contact-section">
            <ToastContainer position="top-right" autoClose={3000} />
            <Container>
                <h2 className="text-center fw-bold mb-4 text-primary animate-pop">
                    Get in Touch
                </h2>
                <Row className="align-items-start">
                    <ContactInfo />
                    <FormColumn
                        formData={formData}
                        handleSubmit={handleSubmit}
                        setFormData={setFormData}
                    />
                </Row>
            </Container>
        </div>
    );
};

const ContactInfo = () => (
    <Col md={6} className="contact-info slide-left">
        <h5 className="mb-4">Contact Information</h5>
        <InfoItem
            Icon={FaMapMarkerAlt}
            text="Road No. 1, KPHB, Hyderabad, Telangana 500072"
        />
        <InfoItem Icon={FaPhoneAlt} text="+91 83747 45738" />
        <InfoItem Icon={FaEnvelope} text="info247mediconnect@gmail.com" />
    </Col>
);

const InfoItem = ({ Icon, text }) => (
    <p className="text-dark">
        <Icon className="me-2 text-primary" />
        {text}
    </p>
);

const FormField = ({ label, type, name, value, setter, placeholder }) => (
    <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control
            type={type}
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={(e) =>
                setter((prev) => ({ ...prev, [name]: e.target.value }))
            }
            required
        />
    </Form.Group>
);

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    setter: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
};

const FormColumn = ({ formData, handleSubmit, setFormData }) => (
    <Col md={6} className="slide-right">
        <Form onSubmit={handleSubmit}>
            <FormField
                label="Your Name"
                type="text"
                name="name"
                value={formData.name}
                setter={setFormData}
                placeholder="Enter your name"
            />
            <FormField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                setter={setFormData}
                placeholder="name@example.com"
            />
            <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Type your message"
                    name="message"
                    value={formData.message}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            message: e.target.value,
                        }))
                    }
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
                Send Message
            </Button>
        </Form>
    </Col>
);

ContactUs.propTypes = {
    formData: PropTypes.object,
    handleSubmit: PropTypes.func,
    setFormData: PropTypes.func,
};

InfoItem.propTypes = {
    Icon: PropTypes.elementType.isRequired,
    text: PropTypes.string.isRequired,
};

FormColumn.propTypes = {
    formData: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    setFormData: PropTypes.func.isRequired,
};

export default ContactUs;
