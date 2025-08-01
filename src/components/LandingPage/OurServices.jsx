import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
    FaStethoscope,
    FaAmbulance,
    FaHeartbeat,
    FaUserMd,
    FaCalendarCheck,
    FaBell,
    FaHospitalUser,
    FaClock
} from "react-icons/fa";
import PropTypes from "prop-types";
import "./LandingPage.css";

const servicesData = [
    { Icon: FaStethoscope, title: "General Consultation", text: "Comprehensive check-ups by experienced physicians", color: "primary" },
    { Icon: FaAmbulance, title: "Emergency Services", text: "24/7 ambulance and emergency care facilities", color: "danger" },
    { Icon: FaHeartbeat, title: "Cardiology", text: "State-of-the-art cardiac care and treatments", color: "success" },
    { Icon: FaUserMd, title: "Specialized Surgeries", text: "Expert surgeons for advanced surgical procedures", color: "info" },
    { Icon: FaCalendarCheck, title: "Easy Appointments", text: "Seamlessly book your hospital visits online", color: "success" },
    { Icon: FaBell, title: "Instant Notifications", text: "Receive timely updates about appointments", color: "warning" },
    { Icon: FaHospitalUser, title: "Doctor Dashboard", text: "Manage patient cases efficiently", color: "primary" },
    { Icon: FaClock, title: "Time Management", text: "Optimize your hospital visits", color: "danger" },
];

const OurServices = () => (
    <Container className="our-services-section my-5">
        <h2 className="text-center mb-4">Our Services</h2>

        {/* For md and up: 3 per row, with last row centered if 2 cards */}
        <div className="d-none d-md-block d-lg-none">
            <Row className="g-4">
                {servicesData.slice(0, 6).map((service, idx) => (
                    <Col key={idx} md={4}>
                        <ServiceCard {...service} />
                    </Col>
                ))}
            </Row>
            <Row className="g-4 justify-content-center mt-2">
                {servicesData.slice(6).map((service, idx) => (
                    <Col key={idx} md={4}>
                        <ServiceCard {...service} />
                    </Col>
                ))}
            </Row>
        </div>

        {/* For lg and up: 4 per row - just 2 rows */}
        <div className="d-none d-lg-block">
            <Row className="g-4">
                {servicesData.map((service, idx) => (
                    <Col key={idx} lg={3}>
                        <ServiceCard {...service} />
                    </Col>
                ))}
            </Row>
        </div>

        {/* For xs and sm: auto stacking */}
        <div className="d-md-none">
            <Row className="g-4">
                {servicesData.map((service, idx) => (
                    <Col key={idx} xs={12} sm={6}>
                        <ServiceCard {...service} />
                    </Col>
                ))}
            </Row>
        </div>
    </Container>
);

const ServiceCard = ({ Icon, title, text, color }) => (
    <Card className="feature-card text-center" data-aos="fade-up">
        <Card.Body>
            <Icon size={50} className={`mb-3 text-${color}`} />
            <Card.Title>{title}</Card.Title>
            <Card.Text>{text}</Card.Text>
        </Card.Body>
    </Card>
);

ServiceCard.propTypes = {
    Icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default OurServices;
