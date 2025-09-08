import { React, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import {
    FaFacebookF,
    FaInstagram,
    FaWhatsapp,
    FaXTwitter,
    FaArrowUp,
    FaClock,
    FaBrain,
    FaXRay,
    FaStethoscope,
    FaUserDoctor,
    FaDroplet,
} from "react-icons/fa6"; // Modern icons
import { FaPhoneAlt, FaHeartbeat, FaMicroscope } from "react-icons/fa"; // FA5 Icons
import { Link } from "react-scroll";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify"; // ✅ Toast for notifications
import "react-toastify/dist/ReactToastify.css";
import "./LandingPage.css";
import logo from "../../assets/brand-logo.png";

const Footer = () => {
    const [showScroll, setShowScroll] = useState(false);
    const [email, setEmail] = useState("");

    const handleScroll = () => setShowScroll(window.scrollY > 200);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter a valid email address", { position: "top-right" });
            return;
        }
        toast.success("🎉 Subscription successful! You'll receive updates soon.", {
            position: "top-right",
        });
        setEmail("");
    };

    return (
        <footer className="custom-footer text-white mt-5 pt-4">
            <Container>
                {/* === First Row === */}
                <Row className="gy-4">
                    <ContactInfo />
                    <QuickLinks />
                    <Departments />
                    <PrimeLocations />
                </Row>

                {/* === Second Row === */}
                <Row className="gy-4 mt-4">
                    <Policies />
                    <Newsletter email={email} setEmail={setEmail} handleSubscribe={handleSubscribe} />
                    <SocialLinks />
                </Row>

                <Copyright />
            </Container>

            {/* Scroll to top button */}
            {showScroll && (
                <button
                    className="scroll-to-top"
                    onClick={scrollToTop}
                    title="Back to top"
                    aria-label="Scroll to top"
                >
                    <FaArrowUp />
                </button>
            )}
        </footer>
    );
};

const ContactInfo = () => (
    <Col md={5}>
        <div className="d-flex align-items-center mb-3">
            <img src={logo} alt="MediConnect Logo" className="footer-logo me-2" />
            <h4 className="fw-bold mb-0">MediConnect Hospital</h4>
        </div>
        <p className="footer-contact">📍 Road No. 1, KPHB, Hyderabad, Telangana 500072</p>
        <p className="footer-contact">✉️ info247mediconnect@gmail.com</p>
        <p className="footer-contact fw-bold">
            <FaPhoneAlt className="me-2 text-warning" />
            24/7 Emergency: +91 83747 45738
        </p>
        <ul className="footer-links list-unstyled mt-2">
            <li className="mb-2">🏥 Emergency Services: Available 24/7</li>
            <li><FaClock className="me-2 text-info" /> Mon - Sat: 8:00 AM – 8:00 PM</li>
            <li><FaClock className="me-2 text-info" /> Sunday: 9:00 AM – 7:00 PM</li>
        </ul>
        {/* ✅ Accreditations / Awards */}
        <p className="footer-accreditation">
            ✅ NABH Accredited | ISO 9001:2015 Certified
        </p>
    </Col>
);

const QuickLinks = () => (
    <Col md={2}>
        <h5 className="fw-bold mb-3">Quick Links</h5>
        <ul className="footer-links list-unstyled">
            {["home", "services", "doctors", "about", "contact"].map((link) => (
                <li key={link} className="mb-2">
                    <Link
                        to={link}
                        smooth={true}
                        duration={500}
                        className="footer-link"
                        spy={true}
                        offset={-70}
                    >
                        {link.charAt(0).toUpperCase() + link.slice(1)}
                    </Link>
                </li>
            ))}
        </ul>
    </Col>
);

const Departments = () => (
    <Col md={3}>
        <h5 className="fw-bold mb-3">Departments</h5>
        <ul className="footer-links list-unstyled">
            <li className="mb-2"><FaHeartbeat className="me-2 text-danger" /> Cardiology</li>
            <li className="mb-2"><FaBrain className="me-2 text-primary" /> Neurology</li>
            <li className="mb-2"><FaStethoscope className="me-2 text-success" /> General Physician</li>
            <li className="mb-2"><FaUserDoctor className="me-2 text-info" /> Dermatology</li>
            <li className="mb-2"><FaDroplet className="me-2 text-warning" /> Nephrology</li>
            <li className="mb-2"><FaMicroscope className="me-2 text-secondary" /> Endocrinology</li>
            <li className="mb-2"><FaXRay className="me-2 text-light" /> Radiology</li>
        </ul>
    </Col>
);

const PrimeLocations = () => (
    <Col md={2}>
        <h5 className="fw-bold mb-3">Prime Locations</h5>
        <ul className="footer-links list-unstyled">
            {["Gachibowli", "Hitechcity", "Kukatpally", "Secunderabad", "Mehdipatnam", "L.B. Nagar"].map(
                (loc, idx) => (
                    <li key={idx} className="mb-2">{loc}</li>
                )
            )}
        </ul>
    </Col>
);

const Policies = () => (
    <Col md={3}>
        <h5 className="fw-bold mb-3">Policies</h5>
        <ul className="footer-links list-unstyled">
            {["privacy-policy", "terms", "cookie-policy", "refund-policy", "disclaimer"].map((p, i) => (
                <li key={i} className="mb-2">
                    <NavLink to={`/${p}`} className="footer-link">
                        {p.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </NavLink>
                </li>
            ))}
        </ul>
    </Col>
);

const Newsletter = ({ email, setEmail, handleSubscribe }) => (
    <Col md={5} className="d-flex flex-column justify-content-start">
        <h5 className="fw-bold mb-3">Subscribe to our Newsletter</h5>
        <p className="small text-light mb-2">
            Get health tips, hospital updates, and appointment reminders straight to your inbox.
        </p>
        <Form className="newsletter-form d-flex" onSubmit={handleSubscribe}>
            <Form.Control
                type="email"
                placeholder="Enter your email"
                className="me-2 rounded-pill"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="light" size="sm" type="submit" className="rounded-pill px-3">
                Subscribe
            </Button>
        </Form>
    </Col>
);

Newsletter.propTypes = {
    email: PropTypes.string.isRequired,
    setEmail: PropTypes.func.isRequired,
    handleSubscribe: PropTypes.func.isRequired,
};

const SocialLinks = () => (
    <Col md={4} className="d-flex align-items-center flex-column">
        <h5 className="fw-bold mb-3">Follow Us</h5>
        <div className="social-icons mt-3 d-flex gap-3">
            {[
                { Icon: FaFacebookF, url: "https://facebook.com/" },
                { Icon: FaInstagram, url: "https://instagram.com/" },
                { Icon: FaWhatsapp, url: "https://whatsapp.com/" },
                { Icon: FaXTwitter, url: "https://twitter.com/" },
            ].map((social, idx) => (
                <SocialIcon key={idx} {...social} />
            ))}
        </div>
    </Col>
);

const SocialIcon = ({ Icon, url }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="social-link">
        <Icon />
    </a>
);

const Copyright = () => (
    <Row>
        <Col className="text-center pt-3">
            <hr />
            <small className="copyright-text fw-semibold">
                © 2025 MediConnect Hospital. All rights reserved.
            </small>
        </Col>
    </Row>
);

SocialIcon.propTypes = {
    Icon: PropTypes.elementType.isRequired,
    url: PropTypes.string.isRequired,
};

export default Footer;
