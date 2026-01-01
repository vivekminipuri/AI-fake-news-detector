import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Link as LinkIcon, FileText, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { analyzeContent, AnalysisResponse } from '../services/api';
import AnalysisResult from '../components/AnalysisResult';
import { Container, Row, Col, Card, Form, Button, Nav, Spinner, Alert } from 'react-bootstrap';

const Home = () => {
    const [inputType, setInputType] = useState<'text' | 'url'>('url');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await analyzeContent(input, inputType);
            setResult(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to analyze content. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5 position-relative">
            {/* Background Blobs */}
            <div className="hero-blob bg-primary" style={{ top: 0, left: '10%' }} />
            <div className="hero-blob bg-secondary" style={{ top: 50, right: '10%' }} />

            <div className="text-center mb-5 mt-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-4 border border-primary border-opacity-25">
                        ✨ Powered by Advanced AI
                    </span>
                    <h1 className="display-2 fw-bold mb-4 tracking-tight">
                        Unmask the <span className="text-gradient-cyan">Truth</span><br />
                        with <span className="gradient-text">Absolute Precision</span>
                    </h1>
                    <p className="lead text-muted mx-auto mb-5 px-3" style={{ maxWidth: 700, fontSize: '1.25rem' }}>
                        The ultimate misinformation guardian. Instantly detect fake news, propaganda, and media bias using state-of-the-art AI analysis.
                    </p>
                </motion.div>
            </div>

            <Row className="justify-content-center mb-5">
                <Col md={8} lg={7}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="glass-card border-0 p-2">
                            <Card.Body className="p-4">
                                <Nav variant="pills" className="mb-4 bg-dark bg-opacity-25 p-1 rounded-4 d-inline-flex border border-white border-opacity-10">
                                    <Nav.Item>
                                        <Nav.Link
                                            active={inputType === 'url'}
                                            onClick={() => setInputType('url')}
                                            className={`d-flex align-items-center gap-2 rounded-4 px-4 py-2 transition-all ${inputType === 'url' ? 'gradient-btn' : 'text-muted'}`}
                                        >
                                            <LinkIcon size={18} /> URL Link
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link
                                            active={inputType === 'text'}
                                            onClick={() => setInputType('text')}
                                            className={`d-flex align-items-center gap-2 rounded-4 px-4 py-2 transition-all ${inputType === 'text' ? 'gradient-btn' : 'text-muted'}`}
                                        >
                                            <FileText size={18} /> Plain Text
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <Form onSubmit={handleAnalyze}>
                                    <div className="position-relative mb-4">
                                        <div className="position-absolute top-0 start-0 h-100 d-flex align-items-center ps-4 text-primary opacity-75">
                                            {inputType === 'url' ? <Search size={24} /> : <FileText size={24} />}
                                        </div>
                                        {inputType === 'url' ? (
                                            <Form.Control
                                                type="url"
                                                placeholder="Paste news article URL here..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                className="bg-dark text-light border-0 py-4 ps-5 rounded-4 form-control-lg bg-opacity-50 shadow-inner"
                                                style={{ paddingLeft: '3.5rem !important' }}
                                                required
                                            />
                                        ) : (
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                placeholder="Paste the news text content here..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                className="bg-dark text-light border-0 py-4 ps-5 rounded-4 bg-opacity-50 shadow-inner"
                                                style={{ paddingLeft: '3.5rem !important' }}
                                                required
                                            />
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-end">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="px-5 py-3 rounded-4 d-flex align-items-center gap-3 fw-bold gradient-btn text-white fs-5 border-0"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner size="sm" animation="border" /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Analyze Veracity <ArrowRight size={22} />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>

                                {error && (
                                    <Alert variant="danger" className="mt-4 mb-0 d-flex align-items-center gap-2 bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger">
                                        <AlertTriangle size={18} /> {error}
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <AnimatePresence>
                {result && <AnalysisResult result={result} />}
            </AnimatePresence>

            <Row className="g-4 mt-5 justify-content-center">
                {[
                    { icon: CheckCircle, title: "AI Powered", desc: "Uses BART Zero-Shot Classification for deep context." },
                    { icon: ShieldAlert, title: "Bias Detection", desc: "Identifies emotional manipulation and clickbait." },
                    { icon: ShieldCheck, title: "Source Check", desc: "Verifies domain reputation against trusted lists." }
                ].map((feature, idx) => (
                    <Col md={4} key={idx}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                        >
                            <Card className="glass-card h-100 border-0 bg-transparent py-2">
                                <Card.Body className="p-4 text-center text-md-start">
                                    <div className="d-inline-flex bg-primary bg-opacity-10 p-3 rounded-4 mb-4 text-primary border border-primary border-opacity-10">
                                        <feature.icon size={32} />
                                    </div>
                                    <h4 className="fw-bold mb-3">{feature.title}</h4>
                                    <p className="text-muted mb-0 lh-lg">{feature.desc}</p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Home;
