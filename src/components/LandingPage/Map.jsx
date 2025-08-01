import React from "react";

const Map = () => (
    <section className="map-section py-5">
        <div className="container">
            <h2 className="text-center fw-bold mb-4 text-primary animate-pop">
                Find Us on the Map
            </h2>
            <p className="lead text-center text-muted mb-4">
                Our hospital is conveniently located to serve you better. Use the map below to find directions.
            </p>
            
            <div className="map-responsive">
                <iframe
                    title="Google Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.331992087633!2d78.3915!3d17.4474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xabcdef!2sMediConnect%20Hospital!5e0!3m2!1sen!2sin!4v1690000000000"
                    allowFullScreen
                    loading="lazy"
                ></iframe>
            </div>
        </div>
    </section>
);

export default Map;
