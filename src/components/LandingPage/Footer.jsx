import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./LandingPage.css";

const Footer = () => (
    <footer className="custom-footer text-white mt-5 pt-4">
        <Container>
            <Row className="gy-4">
                <ContactInfo />
                <QuickLinks />
                <SocialLinks />
            </Row>
            <Copyright />
        </Container>
    </footer>
);

const ContactInfo = () => (
    <Col md={4}>
        <h5 className="fw-bold mb-3">MediConnect Hospital</h5>
        <p className="footer-contact">📍 Road No. 1, KPHB, Hyderabad, Telangana 500072</p>
        <p className="footer-contact">✉️ info@mediconnect.com</p>
        <p className="footer-contact">📞 +91 83747 45738</p>
    </Col>
);

const QuickLinks = () => (
    <Col md={4}>
        <h5 className="fw-bold mb-3">Quick Links</h5>
        <ul className="footer-links list-unstyled">
            {["home", "services", "doctors", "about", "contact"].map((link) => (
                <li key={link} className="mb-2">
                    <Link to={`/${link}`} className="footer-link">
                        {link.charAt(0).toUpperCase() + link.slice(1)}
                    </Link>
                </li>
            ))}
        </ul>
    </Col>
);

const SocialLinks = () => (
    <Col md={4}>
        <h5 className="fw-bold mb-3">Follow Us</h5>
        <div className="social-icons mt-3 d-flex flex-wrap gap-3">
            {[
                { Icon: FaFacebookF, url: "https://facebook.com/", platform: "Facebook" },
                { Icon: FaInstagram, url: "https://instagram.com/", platform: "Instagram" },
                { Icon: FaWhatsapp, url: "https://whatsapp.com/", platform: "WhatsApp" },
                { Icon: FaXTwitter, url: "https://twitter.com/", platform: "Twitter" },
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
