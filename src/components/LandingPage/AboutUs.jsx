import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaHospitalAlt, FaUserMd, FaSmile, FaProcedures } from "react-icons/fa";
import CountUp from "react-countup";
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
            <Stats />
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

// Stats Data
const stats = [
    { icon: <FaHospitalAlt size={40} className="text-primary mb-2" />, end: 20, suffix: "+", label: "Years of Experience" },
    { icon: <FaUserMd size={40} className="text-success mb-2" />, end: 50, suffix: "+", label: "Specialists" },
    { icon: <FaSmile size={40} className="text-info mb-2" />, end: 10000, suffix: "+", label: "Happy Patients" },
    { icon: <FaProcedures size={40} className="text-danger mb-2" />, end: 100, suffix: "+", label: "Surgeries / Month" },
];

const Stats = () => (
    <Row className="mt-5 text-center g-4">
        {stats.map((stat, idx) => (
            <Col xs={6} md={3} key={idx} data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="stat-card p-3 rounded bg-light shadow-sm h-100">
                    <div>{stat.icon}</div>
                    <h4 className="mt-2">
                        <CountUp end={stat.end} duration={2} suffix={stat.suffix} />
                    </h4>
                    <p className="mb-0">{stat.label}</p>
                </div>
            </Col>
        ))}
    </Row>
);

export default AboutUs;
