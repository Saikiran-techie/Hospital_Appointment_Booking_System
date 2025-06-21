import React, { useState } from "react";
import { Navbar, Nav, Container, Button, Offcanvas } from "react-bootstrap";
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { FaTimes, FaBars } from "react-icons/fa";
import logoImg from "../../assets/brand-logo.png";
import "../../styles/custom.css";

const NavigationBar = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const navItems = ["home", "services", "doctors", "about", "contact"];

    const handleClose = () => setShowOffcanvas(false);
    const handleShow = () => setShowOffcanvas(true);

    return (
        <>
            <Navbar expand="lg" variant="dark" className="custom-navbar" sticky="top">
                <Container>
                    <Navbar.Brand as={RouterLink} to="/" className="d-flex align-items-center gap-2">
                        <img src={logoImg} alt="Hospital Logo" className="logo-img me-2" />
                        <span className="brand-name">MediConnect <h4>Hospital</h4></span>
                    </Navbar.Brand>

                    <Navbar.Toggle
                        aria-controls="offcanvasNavbar"
                        onClick={handleShow}
                        className="custom-toggler d-lg-none"
                        aria-label="Toggle navigation menu"
                    >
                        <FaBars size={24} color="#ffffff" />
                    </Navbar.Toggle>

                    <Nav className="ms-auto d-none d-lg-flex align-items-center">
                        {navItems.map((item) => (
                            <Nav.Link
                                key={item}
                                as={ScrollLink}
                                to={item}
                                smooth={true}
                                duration={500}
                                offset={-70}
                                activeClass="active-nav-link"
                                spy={true}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Nav.Link>
                        ))}
                        <RouterLink to="/signup">
                            <Button className="custom-signup-btn ms-3 me-2">Sign Up</Button>
                        </RouterLink>
                        <RouterLink to="/login">
                            <Button className="custom-login-btn">Login</Button>
                        </RouterLink>
                    </Nav>
                </Container>
            </Navbar>

            <Offcanvas
                show={showOffcanvas}
                onHide={handleClose}
                placement="end"
                className="custom-offcanvas"
            >
                <Offcanvas.Header className="offcanvas-header">
                    <Button
                        variant="link"
                        onClick={handleClose}
                        className="close-btn ms-auto"
                        aria-label="Close navigation"
                    >
                        <FaTimes size={30} color="#ffffff" />
                    </Button>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column justify-content-center align-items-center">
                    <Nav className="flex-column text-center">
                        {navItems.map((item) => (
                            <Nav.Link
                                key={item}
                                as={ScrollLink}
                                to={item}
                                smooth={true}
                                duration={500}
                                offset={-70}
                                onClick={handleClose}
                                activeClass="active-nav-link"
                                spy={true}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Nav.Link>
                        ))}
                    </Nav>
                    <div className="mt-4 d-flex flex-column gap-3 w-75">
                        <RouterLink to="/signup" onClick={handleClose}>
                            <Button className="custom-signup-btn w-100">Sign Up</Button>
                        </RouterLink>
                        <RouterLink to="/login" onClick={handleClose}>
                            <Button className="custom-login-btn w-100">Login</Button>
                        </RouterLink>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default NavigationBar;
