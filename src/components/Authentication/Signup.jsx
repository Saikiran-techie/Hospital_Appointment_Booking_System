import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Modal } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerWithEmailPassword, signInWithGoogle } from '../../services/authService';
import { auth } from '../../firebase/firebaseConfig';
import { saveUserData, saveRoleSpecificData } from '../../services/firestoreService';
import './Auth.css';
import { useLoading } from '../../context/LoadingContext';
import { motion } from 'framer-motion';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        specialization: '',
        agree: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { setLoading } = useLoading();

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const [googleRole, setGoogleRole] = useState('');
    const [googleSpecialization, setGoogleSpecialization] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const togglePassword = () => setShowPassword((prev) => !prev);
    const toggleConfirm = () => setShowConfirm((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, confirmPassword, role, agree, specialization } = formData;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;

        if (name.trim().length < 3) return toast.error('Name must be at least 3 characters.');
        if (!emailRegex.test(email)) return toast.error('Please enter a valid email address.');
        if (!passwordRegex.test(password)) return toast.error('Password must be strong.');
        if (password !== confirmPassword) return toast.error('Passwords do not match.');
        if (!role) return toast.error('Please select your role.');
        if (role === 'Doctor' && specialization.trim().length < 2) return toast.error('Please enter your specialization.');
        if (!agree) return toast.error('You must agree to the terms.');

        try {
            setLoading(true);
            const userCredential = await registerWithEmailPassword(name, email, password, role);
            const { uid } = userCredential.user;

            await saveUserData(uid, name, email, role, 'email', specialization);
            await saveRoleSpecificData(uid, name, email, role, specialization);

            toast.success('Account created successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setLoading(true);
            const { user } = await signInWithGoogle();
            setGoogleUser(user);
            setShowRoleModal(true); // open role modal
        } catch (error) {
            toast.error(error.message);
            if (auth.currentUser) await auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRoleSubmit = async () => {
        if (!googleRole) return toast.error('Please select a role.');
        if (googleRole === 'Doctor' && googleSpecialization.trim().length < 2) {
            return toast.error('Please enter a valid specialization.');
        }

        try {
            setLoading(true);
            const uid = googleUser.uid;
            const name = googleUser.displayName;
            const email = googleUser.email;

            await saveUserData(uid, name, email, googleRole, 'google', googleSpecialization);
            await saveRoleSpecificData(uid, name, email, googleRole, googleSpecialization);

            toast.success('Google signup successful!');
            navigate(`/${googleRole.toLowerCase()}-dashboard`);
        } catch (error) {
            toast.error(error.message);
            if (auth.currentUser) await auth.signOut();
        } finally {
            setShowRoleModal(false);
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <Container>
                <Row className="justify-content-center">
                    <Col md={7} lg={6}>
                        {/* Animated Title with top spacing */}
                        <motion.h3
                            className="auth-title text-center mb-4"
                            style={{ marginTop: '2rem' }}
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            Create Your Account
                        </motion.h3>

                        {/* Animated Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="auth-card p-4 shadow">
                                <Card.Body>
                                    <Form onSubmit={handleSubmit} noValidate>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3 position-relative">
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button type="button" className="password-toggle" onClick={togglePassword}>
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </Form.Group>

                                        <Form.Group className="mb-3 position-relative">
                                            <Form.Control
                                                type={showConfirm ? 'text' : 'password'}
                                                name="confirmPassword"
                                                placeholder="Confirm Password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button type="button" className="password-toggle" onClick={toggleConfirm}>
                                                {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                                                <option value="">Select Your Role</option>
                                                <option value="Patient">Patient</option>
                                                <option value="Doctor">Doctor</option>
                                            </Form.Select>
                                        </Form.Group>

                                        {formData.role === 'Doctor' && (
                                            <Form.Group className="mb-3">
                                                <Form.Control
                                                    type="text"
                                                    name="specialization"
                                                    placeholder="Specialization"
                                                    value={formData.specialization}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>
                                        )}

                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="checkbox"
                                                name="agree"
                                                label={
                                                    <span>
                                                        I agree to the{' '}
                                                        <Link to="/terms" className="auth-link">Terms & Conditions</Link>
                                                    </span>
                                                }
                                                checked={formData.agree}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Button type="submit" className="auth-button w-100 mb-3">
                                            Create Account
                                        </Button>
                                    </Form>

                                    <div className="text-center my-3 text-muted">or</div>

                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleGoogleSignup}
                                        className="google-auth-btn w-100 mb-4"
                                    >
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                                            alt="Google icon"
                                            className="me-2"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        Continue with Google
                                    </Button>

                                    <p className="text-center auth-link-text">
                                        Already have an account? <Link to="/login" className="auth-link">Log In</Link>
                                    </p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>

            {/* Role selection modal for Google Signup */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Select
                                value={googleRole}
                                onChange={(e) => setGoogleRole(e.target.value)}
                            >
                                <option value="">Select Your Role</option>
                                <option value="Patient">Patient</option>
                                <option value="Doctor">Doctor</option>
                            </Form.Select>
                        </Form.Group>

                        {googleRole === 'Doctor' && (
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Specialization"
                                    value={googleSpecialization}
                                    onChange={(e) => setGoogleSpecialization(e.target.value)}
                                />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleGoogleRoleSubmit}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Signup;
