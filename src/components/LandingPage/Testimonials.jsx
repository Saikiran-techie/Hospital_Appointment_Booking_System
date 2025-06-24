import React, { useEffect } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './LandingPage.css';

const testimonials = [
    {
        name: 'Sai Teja',
        image: 'https://randomuser.me/api/portraits/men/61.jpg',
        rating: 5,
        feedback: 'The doctors here are highly professional and truly care about patients. My experience was excellent! I felt like I was being treated by family, not just staff.',
    },
    {
        name: 'Divya Reddy',
        image: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 4,
        feedback: 'Wonderful experience with the hospital staff. The treatment was smooth and hassle-free. It was heartwarming how the nurses checked on me every few hours.',
    },
    {
        name: 'Kiran Kumar',
        image: 'https://randomuser.me/api/portraits/men/64.jpg',
        rating: 5,
        feedback: 'State-of-the-art facilities and caring doctors. Highly recommend this hospital to everyone. Even the canteen food was surprisingly good and hygienic.',
    },
    {
        name: 'Bhavani Devi',
        image: 'https://randomuser.me/api/portraits/women/71.jpg',
        rating: 5,
        feedback: 'Very neat, hygienic and friendly environment. I am very satisfied with their services. It was comforting to have such personal attention during my stay.',
    },
];

const Testimonials = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
        });
    }, []);

    return (
        <section className="testimonials-section py-5">
            <Container>
                <h2 className="text-center fw-bold mb-4 text-primary">What Our Patients Say</h2>
                <Row>
                    {testimonials.map((item, index) => (
                        <Col md={6} lg={3} key={index} className="mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                            <Card className="testimonial-card shadow h-100 text-center">
                                <div className="testimonial-img-wrapper mx-auto mt-4 mb-2">
                                    <Card.Img
                                        variant="top"
                                        src={item.image}
                                        alt={item.name}
                                        className="testimonial-img"
                                    />
                                </div>
                                <Card.Body>
                                    <Card.Text className="testimonial-feedback text-muted">{item.feedback}</Card.Text>
                                    <div className="d-flex justify-content-center mb-2">
                                        {[...Array(item.rating)].map((_, i) => (
                                            <FaStar key={i} color="#ffc107" />
                                        ))}
                                    </div>
                                    <h5 className="testimonial-name">{item.name}</h5>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Testimonials;
