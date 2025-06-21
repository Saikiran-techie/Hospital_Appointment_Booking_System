import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth } from '../../firebase/firebaseConfig';
import { setAuthPersistence, loginWithEmailPassword, signInWithGoogle } from '../../services/authService';
import { getUserData } from '../../services/firestoreService';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, role, rememberMe } = formData;

    if (!role) {
      Swal.fire('Select Role', 'Please select a role before logging in.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await setAuthPersistence(rememberMe);
      const user = await loginWithEmailPassword(email, password);
      const userDoc = await getUserData(user.uid);

      if (!userDoc.exists()) {
        setLoading(false);
        Swal.fire('User Not Found', 'No user record found. Please signup first.', 'error');
        await auth.signOut();
        return;
      }

      const storedRole = userDoc.data().role;
      if (storedRole !== role.toLowerCase()) {
        setLoading(false);
        Swal.fire('Role Mismatch', `Selected role doesn't match your registered role (${storedRole}).`, 'error');
        await auth.signOut();
        return;
      }

      setLoading(false);
      Swal.fire('Login Successful!', 'Welcome back!', 'success');
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');

    } catch (error) {
      setLoading(false);
      Swal.fire('Login Failed', error.message, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // No loading spinner yet — open popup first
      await setAuthPersistence(formData.rememberMe);
      const { user } = await signInWithGoogle();

      if (!user || !user.uid) {
        Swal.fire('Sign-in Error', 'Could not retrieve user info. Try again.', 'error');
        return;
      }

      // Prompt for role selection AFTER Google sign-in
      const { value: role } = await Swal.fire({
        title: 'Select Your Role',
        input: 'select',
        inputOptions: {
          patient: 'Patient',
          doctor: 'Doctor',
        },
        inputPlaceholder: 'Select role',
        showCancelButton: true,
      });

      if (!role) {
        await auth.signOut();
        Swal.fire('Cancelled', 'Role selection is required to proceed.', 'info');
        return;
      }

      // NOW start loading spinner for verification
      setLoading(true);

      const userDoc = await getUserData(user.uid);
      if (!userDoc.exists()) {
        setLoading(false);
        Swal.fire('User Not Found', 'No user record found. Please signup first.', 'error');
        await auth.signOut();
        return;
      }

      const storedRole = userDoc.data().role;
      if (storedRole !== role) {
        setLoading(false);
        Swal.fire('Role Mismatch', `Selected role doesn't match your registered role (${storedRole}).`, 'error');
        await auth.signOut();
        return;
      }

      setLoading(false);
      await Swal.fire('Login Successful!', 'Welcome back!', 'success');
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');


    } catch (error) {
      setLoading(false);
      Swal.fire('Login Failed', error.message, 'error');
    }
  };
  

  return (
    <div className="auth-wrapper">
      <Container>
        <Row className="justify-content-center">
          <Col md={7} lg={6}>
            <Card className="auth-card p-4">
              <Card.Body>
                <h2 className="auth-title">Welcome Back</h2>

                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="password" className="mb-3 position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <div
                      className="password-toggle"
                      onClick={togglePassword}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && togglePassword()}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="role" className="mb-3">
                    <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                      <option value="">Select Role</option>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="form-switch mb-3 d-flex justify-content-between align-items-center">
                    <Form.Check
                      type="checkbox"
                      label="Remember Me"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    />
                    <a href="/reset-password" className="auth-link">Forgot Password?</a>
                  </div>

                  <Button type="submit" className="auth-button w-100 mb-3">
                    Login
                  </Button>
                </Form>

                <div className="text-center my-3 text-muted">or</div>

                <Button
                  variant="outline-secondary"
                  onClick={handleGoogleLogin}
                  className="google-auth-btn w-100"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                    alt="Google"
                    className="me-2"
                  />
                  Sign in with Google
                </Button>

                <p className="text-center mt-4">
                  Don't have an account?{' '}
                  <a href="/signup" className="auth-link">Sign Up</a>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {loading && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="primary" />
        </div>
      )}
    </div>
  );
};

export default Login;
