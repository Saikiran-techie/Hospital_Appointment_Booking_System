import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import "../LandingPage/LandingPage.css";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!Object.values(formData).every(Boolean)) {
            Swal.fire("Please fill in all fields!", "", "warning");
            return;
        }
        Swal.fire({
            title: "Message Sent!",
            text: "We’ll get back to you soon.",
            icon: "success",
            confirmButtonColor: "#0d6efd",
        });
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="contact-section py-5">
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
        <InfoItem Icon={FaEnvelope} text="info@mediconnect.com" />
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
            onChange={(e) => setter(prev => ({ ...prev, [name]: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
                Send Message
            </Button>
        </Form>
    </Col>
);

// Add PropTypes for all components
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