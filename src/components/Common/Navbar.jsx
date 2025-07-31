import React, { useState } from "react";
import {
    Navbar,
    Nav,
    Container,
    Button
} from "react-bootstrap";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { FaTimes, FaBars } from "react-icons/fa";
import logoImg from "../../assets/brand-logo.png";
import "../../styles/custom.css";

const NavigationBar = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const navItems = ["home", "services", "doctors", "about", "contact"];

    const handleToggle = () => setShowOffcanvas(!showOffcanvas);
    const handleClose = () => setShowOffcanvas(false);

    return (
        <>

            {/* Custom Offcanvas dropdown under navbar */}
            <div className={`custom-mobile-offcanvas ${showOffcanvas ? 'show' : ''}`}>
                <Nav className="flex-column text-center">
                    {navItems.map((item) => (
                        <Nav.Link
                            key={item}
                            as={ScrollLink}
                            to={item}
                            smooth={true}
                            duration={500}
                            offset={-75}
                            onClick={handleClose}
                            activeClass="active-nav-link"
                            spy={true}
                            className="my-2 text-white"
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Nav.Link>
                    ))}
                </Nav>

                <div className="mt-4 d-flex flex-column gap-3 px-4">
                    <RouterLink to="/signup" onClick={handleClose}>
                        <Button variant="outline-light" className="rounded-pill w-100">Sign Up</Button>
                    </RouterLink>
                    <RouterLink to="/login" onClick={handleClose}>
                        <Button variant="light" className="rounded-pill w-100">Login</Button>
                    </RouterLink>
                </div>
            </div>
            
            {/* Fixed Navbar */}
            <Navbar expand="lg" variant="dark" className="custom-navbar fixed-top z-3">
                <Container>
                    <Navbar.Brand as={RouterLink} to="/" className="d-flex align-items-center gap-2">
                        <img src={logoImg} alt="Hospital Logo" className="logo-img me-2" />
                        <span className="brand-name d-flex flex-column">
                            MediConnect <h4 className="mb-0 text-white">Hospital</h4>
                        </span>
                    </Navbar.Brand>

                    {/* Hamburger Icon */}
                    <button
                        className="d-lg-none btn p-0 border-0 bg-transparent"
                        onClick={handleToggle}
                        aria-label="Toggle navigation menu"
                        type="button"
                    >
                        {showOffcanvas ? (
                            <FaTimes size={28} color="#ffffff" />
                        ) : (
                            <FaBars size={24} color="#ffffff" />
                        )}
                    </button>

                    {/* Desktop Nav */}
                    <Nav className="ms-auto d-none d-lg-flex align-items-center">
                        {navItems.map((item) => (
                            <Nav.Link
                                key={item}
                                as={ScrollLink}
                                to={item}
                                smooth={true}
                                duration={500}
                                offset={-75}
                                activeClass="active-nav-link"
                                spy={true}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Nav.Link>
                        ))}
                        <RouterLink to="/signup">
                            <Button variant="outline-light" className="ms-3 me-2 rounded-pill px-4">Sign Up</Button>
                        </RouterLink>
                        <RouterLink to="/login">
                            <Button variant="light" className="rounded-pill px-4">Login</Button>
                        </RouterLink>
                    </Nav>
                </Container>
            </Navbar>

            {/* Spacer to push content below fixed navbar */}
            <div className="navbar-spacer"></div>

        </>
    );
};

export default NavigationBar;
