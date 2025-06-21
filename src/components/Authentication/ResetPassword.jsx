import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';  // <-- use service function
import './Auth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            Swal.fire('Error', 'Please enter your email address', 'error');
            return;
        }

        try {
            await resetPassword(email);  // <-- call service
            Swal.fire('Success', 'Password reset email sent!', 'success').then(() => {
                navigate('/login');
            });
        } catch (error) {
            let message = 'An error occurred';
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email address';
            } else {
                message = error.message;
            }
            Swal.fire('Error', message, 'error');
        }
    };

    return (
        <div className="auth-wrapper">
            <Container>
                <Row className="justify-content-center">
                    <Col md={7} lg={6}>
                        <Card className="auth-card p-4">
                            <Card.Body>
                                <h2 className="auth-title">Reset Password</h2>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group controlId="email" className="mb-3">
                                        <Form.Control
                                            type="email"
                                            placeholder="Registered Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Button type="submit" className="auth-button w-100">
                                        Send Reset Link
                                    </Button>
                                </Form>
                                <p className="text-center mt-4">
                                    Remember password? <Link to="/login" className="auth-link">Login</Link>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ResetPassword;
