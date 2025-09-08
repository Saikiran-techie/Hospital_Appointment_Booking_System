// ✅ ResetPassword.jsx with toast notifications + smooth animations
import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../../services/authService';
import { motion } from 'framer-motion'; // 👈 add framer-motion for animation
import './Auth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.warn('Please enter your email address', { position: 'top-right' });
            return;
        }

        try {
            setLoading(true);
            await resetPassword(email);
            toast.success('Password reset email sent!', { position: 'top-right' });

            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            let message = 'An error occurred';
            if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email address';
            } else {
                message = error.message;
            }
            toast.error(message, { position: 'top-right' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Container>
                <Row className="justify-content-center">
                    <Col md={7} lg={6}>
                        {/* ✅ Animated card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
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
                                        Remember password?{' '}
                                        <Link to="/login" className="auth-link">Login</Link>
                                    </p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>

            {loading && (
                <motion.div
                    className="loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Spinner animation="border" variant="primary" />
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default ResetPassword;
