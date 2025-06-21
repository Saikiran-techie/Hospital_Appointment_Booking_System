import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import aboutImage from "../../assets/about-us.jpg";
import "../LandingPage/LandingPage.css";

const AboutUs = () => (
    <div className="about-section py-5">
        <Container>
            <h2 className="text-center fw-bold mb-4 text-primary">
                About MediConnect Hospital
            </h2>
            <Row className="align-items-center">
                <ImageColumn />
                <TextColumn />
            </Row>
        </Container>
    </div>
);

const ImageColumn = () => (
    <Col md={6} className="mb-4 mb-md-0">
        <img
            src={aboutImage}
            alt="About MediCure"
            className="about-img w-100"
            loading="lazy"
        />
    </Col>
);

const TextColumn = () => (
    <Col md={6}>
        <p className="lead text-dark mb-3">
            At <strong>MediConnect Hospital</strong>, we’re dedicated to delivering the highest standards of healthcare with empathy, innovation, and integrity. With a legacy of medical excellence spanning over <strong>20 years</strong>, we have earned the trust of countless patients and their families.
        </p>
        <p className="text-dark mb-3">
            Our hospital is equipped with <strong>state-of-the-art technology</strong>, modern infrastructure, and a team of highly experienced specialists committed to your well-being. From routine checkups to complex surgeries, MediCure offers comprehensive care tailored to each patient.
        </p>
        <p className="text-dark mb-3">
            We take pride in being a <strong>multi-specialty hospital</strong> providing advanced cardiac care, neurology, internal medicine, nephrology, and more — all under one roof. Our patient-centric environment ensures comfort, safety, and transparency at every stage of your treatment journey.
        </p>
        <p className="text-dark mb-0">
            Discover compassionate care, reliable expertise, and a team dedicated to putting your health first — every time you walk through our doors.
        </p>
    </Col>
);

export default AboutUs;
