import React from 'react';
import { Container, Row, Col, Card, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './TermsPage.css';

const TermsPage = () => {
    return (
        <div className="terms-page">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={10} xl={8}>
                        <Breadcrumb className="mb-4">
                            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
                            <Breadcrumb.Item active>Terms of Service</Breadcrumb.Item>
                        </Breadcrumb>

                        <div className="terms-header text-center mb-5">
                            <h1 className="display-4 mb-3">Terms of Service</h1>
                            <p className="text-muted">Effective Date: {new Date().toLocaleDateString()}</p>
                        </div>

                        <Card className="terms-card shadow-sm">
                            <Card.Body>
                                <section className="terms-section mb-5">
                                    <h3 className="section-title mb-4">1. Acceptance of Terms</h3>
                                    <p>
                                        By accessing or using <strong>MediConnect Hospital's</strong> appointment booking system,
                                        you agree to be bound by these Terms of Service. If you disagree with any part, you may not access our services.
                                    </p>
                                </section>

                                <hr className="section-divider" />

                                <section className="terms-section mb-5">
                                    <h3 className="section-title mb-4">2. User Responsibilities</h3>
                                    <ul className="terms-list">
                                        <li>Provide accurate and complete registration information.</li>
                                        <li>Maintain confidentiality of your account credentials.</li>
                                        <li>Use services only for lawful medical purposes.</li>
                                        <li>Notify us immediately of unauthorized account use.</li>
                                    </ul>
                                </section>

                                <hr className="section-divider" />

                                <section className="terms-section mb-5">
                                    <h3 className="section-title mb-4">3. Appointment Management</h3>
                                    <p>
                                        Patients must cancel appointments at least 24 hours in advance.
                                        Repeated no-shows may result in service restrictions.
                                    </p>
                                </section>

                                <hr className="section-divider" />

                                <section className="terms-section mb-5">
                                    <h3 className="section-title mb-4">4. Privacy & Data Security</h3>
                                    <p>
                                        We adhere to HIPAA regulations and protect your health information.
                                        All medical data is encrypted and accessible only to authorized medical professionals involved in your care.
                                    </p>
                                </section>

                                <hr className="section-divider" />

                                <section className="terms-section mb-5">
                                    <h3 className="section-title mb-4">5. Intellectual Property</h3>
                                    <p>
                                        All content, logos, and software associated with our platform are property of <strong>MediConnect Hospital</strong>. Unauthorized use is prohibited.
                                    </p>
                                </section>

                                <hr className="section-divider" />

                                <section className="terms-section mb-4">
                                    <h3 className="section-title mb-4">6. Limitation of Liability</h3>
                                    <p>
                                        While we ensure the highest standards of care, <strong>MediConnect Hospital </strong>
                                        shall not be liable for indirect damages arising from service use.
                                        Medical decisions remain the responsibility of treating physicians.
                                    </p>
                                </section>

                                <div className="text-center mt-5">
                                    <Link to="/Signup" className="btn btn-primary btn-lg terms-button">
                                        Back to Signup
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>

                        <footer className="terms-footer text-center mt-4">
                            <p className="text-muted small">
                                Last updated: {new Date().toLocaleDateString()} &nbsp; | &nbsp;
                                Contact: <a href="mailto:info@mediconnect.com">info@mediconnect.com</a>
                            </p>
                        </footer>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TermsPage;
