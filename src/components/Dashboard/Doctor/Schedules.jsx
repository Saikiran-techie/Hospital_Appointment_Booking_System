import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import { Button, Card } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FaGoogle, FaCalendarAlt } from "react-icons/fa";
import "./Schedules.css";

const CLIENT_ID = "http://70735481130-d0vln4s29itk51qk9q3t9dj3nplrllh9.apps.googleusercontent.com"; // Replace with your Google Client ID
const API_KEY = "AIzaSyDinoKwOx4AUIfWWfZzGAcpCzkUfcmXApU"; // Optional if you're not using API key calls
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const Schedules = () => {
    const [events, setEvents] = useState([]);
    const [isSignedIn, setIsSignedIn] = useState(false);

    useEffect(() => {
        const initClient = () => {
            gapi.client
                .init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    scope: SCOPES,
                    discoveryDocs: [
                        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    ],
                })
                .then(() => {
                    const authInstance = gapi.auth2.getAuthInstance();
                    setIsSignedIn(authInstance.isSignedIn.get());
                    authInstance.isSignedIn.listen(setIsSignedIn);
                    if (authInstance.isSignedIn.get()) {
                        listEvents();
                    }
                });
        };

        gapi.load("client:auth2", initClient);
    }, []);

    const listEvents = async () => {
        const response = await gapi.client.calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            showDeleted: false,
            singleEvents: true,
            orderBy: "startTime",
        });

        const fetchedEvents = response.result.items.map((event) => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end?.dateTime || event.end?.date,
            allDay: !event.start.dateTime,
        }));

        setEvents(fetchedEvents);
    };

    const handleDateClick = async (arg) => {
        const summary = prompt("Enter Event Title");
        if (!summary) return;

        const event = {
            summary,
            start: {
                dateTime: `${arg.dateStr}T10:00:00`,
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: `${arg.dateStr}T11:00:00`,
                timeZone: "Asia/Kolkata",
            },
        };

        await gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: event,
        });

        listEvents();
    };

    const handleAuthClick = () => {
        gapi.auth2.getAuthInstance().signIn();
    };

    const handleSignOutClick = () => {
        gapi.auth2.getAuthInstance().signOut();
    };

    return (
        <div className="schedules-container">
            <Card className="shadow-sm mb-3">
                <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <h4 className="mb-0 d-flex align-items-center">
                        <FaCalendarAlt className="me-2 text-primary" />
                        My Google Calendar Schedule
                    </h4>
                    <div>
                        {isSignedIn ? (
                            <Button variant="danger" onClick={handleSignOutClick}>
                                Sign Out
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={handleAuthClick}>
                                <FaGoogle className="me-2" /> Connect Google Calendar
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Body>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            start: "prev,next today",
                            center: "title",
                            end: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        events={events}
                        dateClick={handleDateClick}
                        height="auto"
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default Schedules;
