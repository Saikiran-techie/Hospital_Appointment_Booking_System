import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import app  from "./firebase/firebaseConfig";

const functions = getFunctions(app);

export default function EmailForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const sendEmail = httpsCallable(functions, "sendEmail");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await sendEmail({
                to_name: name,
                from_name: "MediConnect",
                message: message,
                reply_to: email
            });
            console.log("✅ Email sent:", res.data);
        } catch (err) {
            console.error("❌ Email send failed:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
            <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} />
            <textarea placeholder="Your Message" value={message} onChange={e => setMessage(e.target.value)} />
            <button type="submit">Send</button>
        </form>
    );
}
