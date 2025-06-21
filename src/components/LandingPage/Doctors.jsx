import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../LandingPage/LandingPage.css";

const doctors = [
    { id: 1, name: "Dr. Priya Sharma", specialisation: "Cardiologist", img: "doctor-1.jpg", availability: "Mon, Wed, Fri: 10:00 AM - 1:00 PM | Sat: 4:00 PM - 7:00 PM" },
    { id: 2, name: "Dr. Arjun Patel", specialisation: "Neurologist", img: "doctor-2.jpg", availability: "Tue, Thu: 11:00 AM - 3:00 PM | Sat: 9:00 AM - 12:00 PM" },
    { id: 3, name: "Dr. Meera Rao", specialisation: "General Physician", img: "doctor-3.jpg", availability: "Mon to Fri: 9:00 AM - 12:00 PM | Sat: 2:00 PM - 5:00 PM" },
    { id: 4, name: "Dr. Abhishek Sharma", specialisation: "Nephrologist", img: "doctor-4.jpg", availability: "Mon, Wed, Fri: 3:00 PM - 6:00 PM | Sun: 10:00 AM - 1:00 PM" },
];

const Doctors = () => (
    <Container className="doctors-section my-5">
        <h2 className="text-center mt-5 mb-4">Meet Our Doctors</h2>
        <Row className="g-4">
            {doctors.map((doctor) => (
                <Col md={3} key={doctor.id}>
                    <DoctorCard {...doctor} />
                </Col>
            ))}
        </Row>
    </Container>
);

const DoctorCard = ({ id, name, specialisation, img, availability }) => (
    <Card className="doctor-card text-center" data-aos="fade-up">
        <div className="position-relative">
            <Card.Img
                variant="top"
                src={require(`../../assets/${img}`)}
                className="doctor-img"
            />
            <div className="available-dot"></div>
        </div>
        <Card.Body>
            <Card.Title>{name}</Card.Title>
            <Card.Text>{specialisation}</Card.Text>
            <Card.Text>{availability}</Card.Text>

            <Link to={`/doctor/${id}`}>
                <Button className="view-button">View</Button>
            </Link>
        </Card.Body>
    </Card>
);

DoctorCard.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    specialisation: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
};

export default Doctors;
