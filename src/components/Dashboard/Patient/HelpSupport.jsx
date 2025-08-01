import React from 'react';
import { Container, Row, Col, Card, Accordion, Button } from 'react-bootstrap';
import {
    FaHeadset,
    FaEnvelope,
    FaPhoneAlt,
    FaWhatsapp,
    FaQuestionCircle
} from 'react-icons/fa';
import './HelpSupport.css';

const HelpSupport = () => {
    return (
        <Container className="help-support-container py-4">
            <h3 className="text-center mb-4 text-primary">
                <FaQuestionCircle className="me-2" /> Help & Support
            </h3>

            <Row className="mb-5 g-4">
                {[{
                    title: "Phone Support",
                    icon: <FaPhoneAlt className="me-2 text-success" />,
                    content: <>
                        <p>For urgent queries, you can reach out to us by phone:</p>
                        <p><strong>Phone:</strong> +91 98765 43210</p>
                    </>
                }, {
                    title: "Email Support",
                    icon: <FaEnvelope className="me-2 text-primary" />,
                    content: <>
                        <p>For detailed issues, drop us an email and we’ll respond within 24 hours.</p>
                        <p><strong>Email:</strong> support@mediconnect.com</p>
                    </>
                }, {
                    title: "WhatsApp Support",
                    icon: <FaWhatsapp className="me-2 text-success" />,
                    content: <>
                        <p>Get instant assistance from our chatbot or support team.</p>
                        <Button variant="success" href="https://wa.me/919876543210" target="_blank">
                            Chat on WhatsApp
                        </Button>
                    </>
                }, {
                    title: "Live Chat (Coming Soon)",
                    icon: <FaHeadset className="me-2 text-warning" />,
                    content: <>
                        <p>We’re working on 24/7 live chat integration to assist you in real time.</p>
                        <Button variant="warning" disabled>
                            Coming Soon
                        </Button>
                    </>
                }].map((item, index) => (
                    <Col key={index} md={6}>
                        <Card className="support-card shadow-sm h-100">
                            <Card.Body className="d-flex flex-column justify-content-between">
                                <div>
                                    <Card.Title>{item.icon}{item.title}</Card.Title>
                                    <Card.Text>{item.content}</Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <h4 className="mb-3">Frequently Asked Questions</h4>
            <Accordion flush>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>How do I view my medical reports?</Accordion.Header>
                    <Accordion.Body>
                        Navigate to the "Medical Reports" section from the sidebar. All uploaded reports will be listed there with download/view options.
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Can I reschedule an appointment?</Accordion.Header>
                    <Accordion.Body>
                        Yes. Go to "My Appointments", find your appointment, and use the reschedule button to select a new time slot.
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>What if I don’t receive a confirmation?</Accordion.Header>
                    <Accordion.Body>
                        If confirmation email/SMS doesn’t arrive, check your spam folder or contact support.
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                    <Accordion.Header>How do I update my profile?</Accordion.Header>
                    <Accordion.Body>
                        Go to the "Profile" section to update your contact details, photo, and medical info.
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                    <Accordion.Header>How do I check my prescriptions?</Accordion.Header>
                    <Accordion.Body>
                        Visit the "Prescriptions" section. You’ll find all your current and past prescriptions, dosage instructions, and prescribing doctors.
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                    <Accordion.Header>Is my data private and secure?</Accordion.Header>
                    <Accordion.Body>
                        Absolutely. All your medical records are stored securely and only accessible to authorized users through encrypted connections.
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                    <Accordion.Header>How do I download my payment receipts?</Accordion.Header>
                    <Accordion.Body>
                        Head to "Payment History", and you’ll find your completed transactions listed. Receipts can be downloaded from there.
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export default HelpSupport;
