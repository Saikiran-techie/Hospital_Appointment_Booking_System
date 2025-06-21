import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "../Common/Navbar";
import Footer from "../LandingPage/Footer";
import Swal from "sweetalert2";
import { Spinner } from "react-bootstrap";
import "./LandingPage.css";

const doctorDetails = {
    1: {
        name: "Dr. Priya Sharma",
        department: "Cardiology",
        specialization: "Cardiologist",
        experience: "10+ years",
        honors: "Recipient of National Heart Care Excellence Award",
        availability: "Mon, Wed, Fri: 10:00 AM - 1:00 PM | Sat: 4:00 PM - 7:00 PM",
        details:
            "Dr. Priya Sharma is a highly experienced cardiologist with a decade of expertise in diagnosing and treating complex cardiac conditions. She specializes in interventional cardiology, heart failure management, and preventive heart care. Dr. Sharma has successfully performed over 2000 cardiac procedures and is known for her compassionate approach toward patients. She frequently conducts awareness programs on heart health and advocates for lifestyle modifications to prevent cardiovascular diseases.",
        img: "doctor-1.jpg",
    },
    2: {
        name: "Dr. Arjun Patel",
        department: "Neurology",
        specialization: "Neurologist",
        experience: "15+ years",
        honors: "Best Neurologist Award, 2023",
        availability: "Tue, Thu: 11:00 AM - 3:00 PM | Sat: 9:00 AM - 12:00 PM",
        details:
            "Dr. Arjun Patel is a distinguished neurologist with over 15 years of experience in treating a wide range of neurological disorders, including stroke, epilepsy, migraines, and neurodegenerative diseases. His expertise in minimally invasive brain surgeries and advanced neuroimaging techniques has made him a sought-after specialist in the country. Dr. Patel regularly participates in international neurology conferences and has published several research papers on epilepsy management.",
        img: "doctor-2.jpg",
    },
    3: {
        name: "Dr. Meera Rao",
        department: "Internal Medicine",
        specialization: "Physician",
        experience: "12+ years",
        honors: "Excellence in Medical Practice Award",
        availability: "Mon to Fri: 9:00 AM - 12:00 PM | Sat: 2:00 PM - 5:00 PM",
        details:
            "Dr. Meera Rao is a well-respected physician with over 12 years of experience in internal medicine. She specializes in adult healthcare, chronic disease management, and complex diagnostic challenges. Dr. Rao has a reputation for her patient-centered care, meticulous attention to detail, and ability to manage multi-system diseases effectively. Apart from clinical practice, she actively participates in health education workshops and has mentored several young medical professionals.",
        img: "doctor-3.jpg",
    },
    4: {
        name: "Dr. Abhishek Sharma",
        department: "Nephrology",
        specialization: "Nephrologist",
        experience: "8+ years",
        honors: "Young Achiever in Renal Care",
        availability: "Mon, Wed, Fri: 3:00 PM - 6:00 PM | Sun: 10:00 AM - 1:00 PM",
        details:
            "Dr. Abhishek Sharma is an accomplished nephrologist known for his expertise in managing acute and chronic kidney diseases. With 8+ years of dedicated practice, he has extensive experience in hemodialysis, peritoneal dialysis, and kidney transplant care. Dr. Sharma advocates for early detection of renal conditions and has pioneered several community outreach programs on kidney health awareness. His empathetic approach and sharp clinical acumen make him a favorite among patients and peers alike.",
        img: "doctor-4.jpg",
    },
};
  
  

function AboutDoctors() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setDoctor(doctorDetails[id]);
            setLoading(false);
        }, 500);
    }, [id]);

    const handleBookAppointment = () => {
        Swal.fire({
            title: "Sign In Required",
            text: "You need to sign in or sign up to book an appointment.",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Login",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
        }).then((result) => {
            if (result.isConfirmed) {
                navigate("/login");
            }
        });
    };

    if (loading) {
        return (
            <div>
                <NavigationBar />
                <div className="d-flex justify-content-center align-items-center my-5">
                    <Spinner animation="border" variant="primary" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div>
                <NavigationBar />
                <div className="text-center my-5">Doctor not found</div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <NavigationBar />
            <div className="container my-5">
                <div className="row g-4 align-items-center">
                    <div className="col-md-5 text-center">
                        <img
                            src={require(`../../assets/${doctor.img}`)}
                            alt={doctor.name}
                            className="about-doctor-img"
                        />
                    </div>
                    <div className="col-md-7">
                        <div className="card shadow-lg border-0">
                            <div className="card-body">
                                <h2 className="card-title">{doctor.name}</h2>
                                <p className="text-secondary mb-1">
                                    <strong>Department:</strong> {doctor.department}
                                </p>
                                <p className="text-secondary mb-1">
                                    <strong>Specialization:</strong> {doctor.specialization}
                                </p>
                                <p className="text-secondary mb-1">
                                    <strong>Experience:</strong> {doctor.experience}
                                </p>
                                <p className="text-secondary mb-3">
                                    <strong>Honors:</strong> {doctor.honors}
                                </p>
                                <p className="text-muted mb-2">
                                    <strong>Availability:</strong> {doctor.availability}
                                </p>
                                <h5 className="mt-4 mb-2">About</h5>
                                <p className="card-text">{doctor.details}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <button
                        className="btn btn-primary btn-lg px-4 py-2"
                        onClick={handleBookAppointment}
                    >
                        Book Appointment
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default AboutDoctors;
