import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Key, Mail } from 'lucide-react';

const Login = () => {
    const { login, googleSignIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Failed to sign in with Google.');
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
                        <h2 className="text-center mb-4 text-light fw-bold">Welcome Back</h2>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
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

                            <Form.Group className="mb-4" controlId="formBasicPassword">
                                <Form.Label className="text-white-50">Password</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-dark border-secondary text-muted"><Key size={18} /></span>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="bg-dark text-light border-secondary"
                                    />
                                </div>
                            </Form.Group>

                            <Button disabled={loading} className="w-100 mb-3 gradient-btn border-0 py-2 fw-bold" type="submit">
                                {loading ? <Spinner size="sm" animation="border" /> : (
                                    <>Sign In <LogIn size={18} className="ms-2" /></>
                                )}
                            </Button>
                        </Form>

                        <div className="text-center mb-3">
                            <span className="text-muted">OR</span>
                        </div>

                        <Button
                            variant="outline-light"
                            className="w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="text-center text-muted">
                            Need an account? <Link to="/signup" className="text-primary text-decoration-none fw-bold">Sign Up</Link>
                        </div>
                    </Card.Body>
                </Card>
            </motion.div>
        </Container>
    );
};

export default Login;
