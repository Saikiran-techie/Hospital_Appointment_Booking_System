import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { registerWithEmailPassword, signInWithGoogle } from '../../services/authService';
import { auth } from '../../firebase/firebaseConfig';
import { saveUserData, saveRoleSpecificData} from '../../services/firestoreService';
import './Auth.css';
import { useLoading } from '../../context/LoadingContext';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        agree: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { setLoading } = useLoading();

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
        const { name, email, password, confirmPassword, role, agree } = formData;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;

        if (name.trim().length < 3) {
            Swal.fire('Invalid Name', 'Name must be at least 3 characters.', 'error');
            return;
        }
        if (!emailRegex.test(email)) {
            Swal.fire('Invalid Email', 'Please enter a valid email address.', 'error');
            return;
        }
        if (!passwordRegex.test(password)) {
            Swal.fire(
                'Weak Password',
                'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
                'error'
            );
            return;
        }
        if (password !== confirmPassword) {
            Swal.fire('Password Mismatch', 'Passwords do not match.', 'error');
            return;
        }
        if (!role) {
            Swal.fire('Role Required', 'Please select your role.', 'error');
            return;
        }
        if (!agree) {
            Swal.fire('Agreement Required', 'You must agree to the terms.', 'error');
            return;
        }

        try {
            setLoading(true);
            const userCredential = await registerWithEmailPassword(name, email, password, role);
            const { uid } = userCredential.user;

            await saveUserData(uid, name, email, role, 'email');
            await saveRoleSpecificData(uid, name, email, role);

            Swal.fire('Success!', 'Account created successfully!', 'success');
            navigate('/login');
        } catch (error) {
            Swal.fire('Signup Failed', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setLoading(true); // show spinner while Google popup is open

            const { user } = await signInWithGoogle(); // only opens popup and returns user

            setLoading(false); // stop spinner while showing role selection popup

            const { value: selectedRole } = await Swal.fire({
                title: 'Select Your Role',
                input: 'select',
                inputOptions: {
                    Patient: 'Patient',
                    Doctor: 'Doctor',
                },
                inputPlaceholder: 'Select a role',
                confirmButtonText: 'Continue',
                allowOutsideClick: false,
                inputValidator: (value) => {
                    if (!value) return 'You need to select a role!';
                },
            });

            if (!selectedRole) {
                await auth.signOut();
                return;
            }

            setLoading(true); // spinner resumes while saving user data

            await saveUserData(user.uid, user.displayName, user.email, selectedRole, 'google');
            await saveRoleSpecificData(user.uid, user.displayName, user.email, selectedRole);

            setLoading(false); // stop spinner before success alert

            await Swal.fire('Success!', 'Google signup successful!', 'success');

            navigate(`/${selectedRole.toLowerCase()}-dashboard`);
        } catch (error) {
            console.error('Google Signup Error:', error);
            await Swal.fire('Registration Failed', error.message, 'error');
            if (auth.currentUser) await auth.signOut();
        } finally {
            setLoading(false);
        }
    };
      

    return (
        <div className="auth-wrapper">
            <Container>
                <Row className="justify-content-center">
                    <Col md={7} lg={6}>
                        <Card className="auth-card p-4">
                            <Card.Body>
                                <h2 className="auth-title mb-4">Create Account</h2>
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
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={togglePassword}
                                            aria-label="Toggle password visibility"
                                        >
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
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={toggleConfirm}
                                            aria-label="Toggle confirm password visibility"
                                        >
                                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Your Role</option>
                                            <option value="Patient">Patient</option>
                                            <option value="Doctor">Doctor</option>
                                        </Form.Select>
                                    </Form.Group>

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
                                    Already have an account?{' '}
                                    <Link to="/login" className="auth-link">Log In</Link>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Signup;
