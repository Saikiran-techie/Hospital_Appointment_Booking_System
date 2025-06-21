import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import heroBanner from "../../assets/hero-banner.png";
import "./LandingPage.css";

const Home = () => {
    return (
        <div className="hero-section d-flex align-items-center">
            <Container>
                <Row className="align-items-center gy-4">
                    {/* Text Content First */}
                    <Col
                        md={6}
                        className="text-center text-md-start slide-left order-1"
                    >
                        <h1 className="display-4 fw-bold text-primary mb-3">
                            Welcome to MediConnect Hospital
                        </h1>
                        <p className="lead text-dark mb-4">
                            Providing world-class medical care and healthcare solutions, 24/7.
                            Our mission is your well-being.
                        </p>
                    </Col>

                    {/* Image Second */}
                    <Col md={6} className="text-center order-2">
                        <img
                            src={heroBanner}
                            alt="Hospital Banner"
                            className="img-fluid hero-img"
                        />
                    </Col>
                </Row>

                <Row className="text-center appointment-section py-5">
                    <Col>
                        <h2 className="fw-bold text-primary mb-3">
                            Hassle-free Hospital Appointment Booking
                        </h2>
                        <p className="lead text-muted mb-4">
                            Book appointments online from the comfort of your home, at your
                            preferred time with top doctors — no long queues, no unnecessary waiting. Get
                            instant confirmation and manage your visits easily.
                        </p>
                        <Link to="/signup">
                            <Button variant="success" size="lg">
                                Book an Appointment
                            </Button>
                        </Link>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home;
