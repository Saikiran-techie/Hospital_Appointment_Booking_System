import React from "react";
import NavigationBar from "../Common/Navbar";
import Home from "./Home";
import OurServices from "./OurServices";
import Doctors from "./Doctors";
import Testimonials from "./Testimonials";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import Footer from "./Footer";

const LandingPage = () => {
    return (
        <div>
            <NavigationBar />
            <section id="home"><Home /></section>
            <section id="services"><OurServices /></section>
            <section id="doctors"><Doctors /></section>
            <section id="testimonials"><Testimonials /></section>
            <section id="about"><AboutUs /></section>
            <section id="contact"><ContactUs /></section>
            <Footer />
        </div>
    );
};

export default LandingPage;