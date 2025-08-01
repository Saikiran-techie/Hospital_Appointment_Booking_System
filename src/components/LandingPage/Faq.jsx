import React, { useState } from "react";

const faqs = [
    {
        q: "How do I book an appointment?",
        a: "Click on 'Book an Appointment' from the Home section. After logging into your dashboard, navigate to 'Book Appointment', complete and submit the appointment form to confirm your booking."
    },
    {
        q: "Can I book an appointment on behalf of someone else?",
        a: "Yes, you can book an appointment for a family member or another individual. While filling out the booking form, simply enter their details such as name, age, and medical concern. Make sure to provide a valid contact number for updates and reminders."
    },
    {
        q: "Do you accept emergency walk-ins?",
        a: "Yes, our emergency department operates 24/7. You can walk in anytime for urgent medical care without a prior appointment."
    },
    {
        q: "Can I cancel or reschedule?",
        a: "Yes, you can easily cancel or reschedule your appointments by logging into your dashboard and going to the 'My Appointments' section."
    },
    {
        q: "Are online consultations available?",
        a: "Yes, we offer virtual consultations with our specialists. While booking, choose 'Online' as your consultation mode and you will receive a video link upon confirmation."
    },
    {
        q: "Which insurance providers do you accept?",
        a: "We accept most major health insurance providers. For a detailed list, please contact our support team or visit the 'Insurance' section of our website."
    },
    {
        q: "How can I access my reports?",
        a: "Log in to your dashboard and click on the 'Reports' section. All your diagnostic and consultation reports will be available for download and review."
    },
    {
        q: "Is parking available?",
        a: "Yes, we provide ample and secure parking space for patients and visitors within the hospital premises, free of charge."
    },
    {
        q: "Can I choose a specific doctor?",
        a: "Yes, while booking an appointment, you can select your preferred doctor based on availability and specialization."
    },
    {
        q: "What are your lab timings?",
        a: "Our diagnostic labs are open daily from 7:00 AM to 8:00 PM, including weekends, to ensure convenient access to medical tests."
    },
    {
        q: "Do I need a referral for specialist visits?",
        a: "No referral is required. You can directly book an appointment with any of our specialists through the dashboard."
    }
];


const Faq = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="faq-section py-5">
            <div className="container">
                <h2 className="text-center fw-bold mb-4 text-primary animate-pop">
                    FAQs
                </h2>
                <div className="accordion">
                    {faqs.map((faq, i) => (
                        <div key={i} className="mb-3">
                            <button
                                className="btn btn-outline-primary w-100 text-start"
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                {faq.q}
                            </button>
                            {openIndex === i && (
                                <div className="bg-light p-3 border border-top-0 rounded-bottom">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Faq;
