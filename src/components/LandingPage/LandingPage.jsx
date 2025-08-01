import React from "react";
import NavigationBar from "../Common/Navbar";
import Home from "./Home";
import OurServices from "./OurServices";
import Doctors from "./Doctors";
import Testimonials from "./Testimonials";
import AboutUs from "./AboutUs";
import Faq from "./Faq";
import ContactUs from "./ContactUs";
import Map from "./Map";
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
            <section id="faq"><Faq /></section>
            <section id="contact"><ContactUs /></section>
            <section id="map"><Map/></section>
            <Footer />
        </div>
    );
};

export default LandingPage;