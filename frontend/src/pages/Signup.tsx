import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Key, Mail, Lock } from 'lucide-react';
import { updateUserProfile } from '../services/api';

const Signup = () => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, name);
            // Save additional details to our backend
            await updateUserProfile({ name, phone });
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Failed to create an account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-100"
                style={{ maxWidth: '400px' }}
            >
                <Card className="glass-card border-0 p-4">
                    <Card.Body>
                        <h2 className="text-center mb-4 text-light fw-bold">Create Account</h2>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Full Name</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><UserPlus size={18} /></span>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="bg-dark text-light border-secondary"
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Phone Number</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><Mail size={18} /></span>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-dark text-light border-secondary"
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label className="text-white-50">Email address</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><Mail size={18} /></span>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-dark text-light border-secondary"
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label className="text-white-50">Password</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><Key size={18} /></span>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="bg-dark text-light border-secondary"
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
                                <Form.Label className="text-white-50">Confirm Password</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><Lock size={18} /></span>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="bg-dark text-light border-secondary"
                                    />
                                </div>
                            </Form.Group>

                            <Button disabled={loading} className="w-100 mb-3 gradient-btn border-0 py-2 fw-bold" type="submit">
                                {loading ? <Spinner size="sm" animation="border" /> : (
                                    <>Sign Up <UserPlus size={18} className="ms-2" /></>
                                )}
                            </Button>
                        </Form>

                        <div className="text-center text-muted">
                            Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Log In</Link>
                        </div>
                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
};

export default Signup;
