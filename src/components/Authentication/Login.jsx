import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { auth } from '../../firebase/firebaseConfig';
import { setAuthPersistence, loginWithEmailPassword, signInWithGoogle } from '../../services/authService';
import { getUserData } from '../../services/firestoreService';
import './Auth.css';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, rememberMe } = formData;

    if (!email || !password) {
      toast.warn('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await setAuthPersistence(rememberMe);
      const user = await loginWithEmailPassword(email, password);
      const userDoc = await getUserData(user.uid);

      if (!userDoc.exists()) {
        toast.error('User not found. Please sign up first.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const storedRole = userDoc.data().role;
      toast.success('Login successful!');
      navigate(`/${storedRole}/dashboard`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await setAuthPersistence(formData.rememberMe);
      const { user } = await signInWithGoogle();

      if (!user || !user.uid) {
        toast.error('Google sign-in failed. Try again.');
        return;
      }

      setLoading(true);
      const userDoc = await getUserData(user.uid);

      if (!userDoc.exists()) {
        toast.error('User not found. Please sign up first.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const storedRole = userDoc.data().role;
      toast.success('Login successful!');
      navigate(`/${storedRole}/dashboard`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Container>
        <Row className="justify-content-center">
          <Col md={7} lg={6}>
            {/* Animated Title with top spacing */}
            <motion.h2
              className="auth-title text-center mb-4"
              style={{ marginTop: '2rem' }}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome Back 👋
            </motion.h2>

            {/* Animated Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="auth-card p-4 shadow">
                <Card.Body>
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

                    <div className="form-switch mb-4 d-flex justify-content-between align-items-center">
                      <Form.Check
                        type="checkbox"
                        label="Remember Me"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <a href="/reset-password" className="auth-link">Forgot Password?</a>
                    </div>

                    <Button type="submit" className="auth-button w-100 mb-2">
                      Login
                    </Button>
                  </Form>

                  <div className="text-center my-2 text-muted">or</div>

                  <Button
                    variant="outline-secondary"
                    onClick={handleGoogleLogin}
                    className="google-auth-btn w-100"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                      alt="Google"
                      className="me-2"
                      style={{ width: '20px', height: '20px' }}
                    />
                    Sign in with Google
                  </Button>

                  <p className="text-center mt-4">
                    Don't have an account?{' '}
                    <a href="/signup" className="auth-link">Sign Up</a>
                  </p>
                </Card.Body>
              </Card>
            </motion.div>
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
