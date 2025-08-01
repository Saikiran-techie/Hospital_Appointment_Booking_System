import React, { useState } from "react";
import {
    Table, Container, Form, Row, Col, Spinner,
    ButtonGroup, Dropdown, DropdownButton
} from "react-bootstrap";
import { useOutletContext } from "react-router-dom";
import { FaSort, FaSortAlphaDown, FaSortAlphaUpAlt } from "react-icons/fa";
import "./PaymentHistory.css";

const PaymentHistory = () => {
    const { appointments, loadingAppointments, userData } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("paymentTimestamp");
    const [sortOrder, setSortOrder] = useState("desc");

    const filteredData = appointments
        .filter(app => app.paymentId && app.bookedBy === userData?.uid)
        .filter(app =>
            app.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.appointmentDate?.includes(searchTerm) ||
            app.paymentMethod?.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (!valA || !valB) return 0;
            if (sortOrder === "asc") return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });

    const formatTimestamp = (timestamp) => {
        if (!timestamp?.toDate) return "N/A";
        const date = timestamp.toDate();
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <Container className="py-3">
            <h2 className="text-center mb-4 text-primary section-title">Payment History</h2>

            <Row className="mb-4 g-2 align-items-center justify-content-center payment-controls">
                <Col xs={12} lg={8}>
                    <Form.Control
                        type="text"
                        placeholder="Search by doctor, specialization, date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-100"
                    />
                </Col>

                <Col xs="auto">
                    <DropdownButton
                        as={ButtonGroup}
                        align="end"  // Force it to align properly
                        drop="down"  // Force dropdown to open downward
                        title={<><FaSort className="me-1" /> Sort By</>}
                        variant="outline-primary"
                        onSelect={(val) => setSortField(val)}
                        className="sort-dropdown"
                    >
                        <Dropdown.Item eventKey="paymentTimestamp">Payment Time</Dropdown.Item>
                        <Dropdown.Item eventKey="appointmentDate">Appointment Date</Dropdown.Item>
                        <Dropdown.Item eventKey="doctor">Doctor</Dropdown.Item>
                        <Dropdown.Item eventKey="paymentMethod">Payment Method</Dropdown.Item>
                    </DropdownButton>
                </Col>

                <Col xs="auto">
                    <DropdownButton
                        as={ButtonGroup}
                        align="end"
                        drop="down"
                        title={sortOrder === "asc"
                            ? <><FaSortAlphaDown className="me-1" /> Ascending</>
                            : <><FaSortAlphaUpAlt className="me-1" /> Descending</>
                        }
                        variant="outline-secondary"
                        onSelect={(val) => setSortOrder(val)}
                        className="sort-dropdown"
                    >
                        <Dropdown.Item eventKey="asc"><FaSortAlphaDown className="me-2" /> Ascending</Dropdown.Item>
                        <Dropdown.Item eventKey="desc"><FaSortAlphaUpAlt className="me-2" /> Descending</Dropdown.Item>
                    </DropdownButton>
                </Col>
            </Row>

            {loadingAppointments ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <div className="payment-table-wrapper">
                    <Table striped bordered hover responsive className="payment-table">
                        <thead className="table-primary text-center align-middle">
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Specialization</th>
                                <th>Appointment Date</th>
                                <th>Time</th>
                                <th>Payment Method</th>
                                <th>Payment ID</th>
                                <th>Payment Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.paymentId}>
                                        <td>{item.fullName} ({item.patientCode})</td>
                                        <td>Dr. {item.doctor}</td>
                                        <td>{item.specialization}</td>
                                        <td>{item.appointmentDate}</td>
                                        <td>{item.appointmentTime}</td>
                                        <td>{item.paymentMethod}</td>
                                        <td>{item.paymentId}</td>
                                        <td>{formatTimestamp(item.paymentTimestamp)}</td>
                                        <td className={item.status === "Completed" ? "text-success fw-bold" : "text-secondary"}>{item.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-muted">No payment records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default PaymentHistory;
