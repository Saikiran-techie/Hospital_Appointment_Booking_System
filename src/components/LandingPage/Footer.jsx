import { React, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
    FaFacebookF,
    FaInstagram,
    FaWhatsapp,
    FaXTwitter,
    FaArrowUp,
} from "react-icons/fa6";
import { Link } from "react-scroll"; // for smooth scrolling
import { NavLink } from "react-router-dom"; // for routing to pages
import PropTypes from "prop-types";
import "./LandingPage.css";
import logo from "../../assets/brand-logo.png";

const Footer = () => {
    const [showScroll, setShowScroll] = useState(false);

    const handleScroll = () => {
        setShowScroll(window.scrollY > 200);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <footer className="custom-footer text-white mt-5 pt-4">
            <Container>
                <Row className="gy-4">
                    <ContactInfo />
                    <QuickLinks />
                    <Policies />
                    <SocialLinks />
                </Row>
                <Copyright />
            </Container>

            {/* Scroll to top arrow */}
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
            <img
                src={logo}
                alt="MediConnect Logo"
                className="footer-logo me-2"
            />
            <h4 className="fw-bold mb-0">MediConnect Hospital</h4>
        </div>
        <p className="footer-contact">
            📍 Road No. 1, KPHB, Hyderabad, Telangana 500072
        </p>
        <p className="footer-contact">✉️ info247mediconnect@gmail.com</p>
        <p className="footer-contact">📞 +91 83747 45738</p>
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

const Policies = () => (
    <Col md={2}>
        <h5 className="fw-bold mb-3">Policies</h5>
        <ul className="footer-links list-unstyled">
            <li className="mb-2">
                <NavLink to="/privacy-policy" className="footer-link">
                    Privacy Policy
                </NavLink>
            </li>
            <li className="mb-2">
                <NavLink to="/terms" className="footer-link">
                    Terms of Service
                </NavLink>
            </li>
            <li className="mb-2">
                <NavLink to="/cookie-policy" className="footer-link">
                    Cookie Policy
                </NavLink>
            </li>
            <li className="mb-2">
                <NavLink to="/refund-policy" className="footer-link">
                    Refund Policy
                </NavLink>
            </li>
            <li className="mb-2">
                <NavLink to="/disclaimer" className="footer-link">
                    Disclaimer
                </NavLink>
            </li>
        </ul>
    </Col>
);

const SocialLinks = () => (
    <Col md={2}>
        <h5 className="fw-bold mb-3">Follow Us</h5>
        <div className="social-icons mt-3 d-flex flex-wrap gap-3">
            {[
                {
                    Icon: FaFacebookF,
                    url: "https://facebook.com/",
                    platform: "Facebook",
                },
                {
                    Icon: FaInstagram,
                    url: "https://instagram.com/",
                    platform: "Instagram",
                },
                {
                    Icon: FaWhatsapp,
                    url: "https://whatsapp.com/",
                    platform: "WhatsApp",
                },
                {
                    Icon: FaXTwitter,
                    url: "https://twitter.com/",
                    platform: "Twitter",
                },
            ].map((social, idx) => (
                <SocialIcon key={idx} {...social} />
            ))}
        </div>
    </Col>
);

const SocialIcon = ({ Icon, url, platform }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="social-link"
        aria-label={`Visit us on ${platform}`}
    >
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
    platform: PropTypes.string.isRequired,
};

export default Footer;
