import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, RotateCcw, ArrowLeftRight, Sparkles, Brain } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const TASKS = [
    { code: 'auto', name: 'Detect Language' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }
];

const TARGET_LANGS = TASKS.filter(l => l.code !== 'auto');

const Translator = () => {
    const { currentUser } = useAuth();
    const [text, setText] = useState('');
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('en');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTranslate = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError('');
        try {
            const token = await currentUser?.getIdToken();
            const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
            const response = await axios.post(`${API_URL}/api/v1/translate`, {
                text,
                source_lang: sourceLang,
                target_lang: targetLang
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTranslatedText(response.data.translated_text);
        } catch (err) {
            console.error(err);
            setError('Translation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const swapLanguages = () => {
        if (sourceLang === 'auto') return;
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setText(translatedText);
        setTranslatedText(text);
    };

    return (
        <Container className="py-5 mt-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 text-center"
            >
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-80 p-3 rounded-circle mb-3 shadow-glow" style={{ boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' }}>
                    <Brain size={40} className="text-white" />
                </div>
                <h1 className="fw-bold text-light mb-2 display-4">
                    Smart <span className="gradient-text">Translator</span>
                </h1>
                <p className="text-muted fs-5 max-w-2xl mx-auto opacity-75">Neural-speed linguistic adaptation with zero context loss.</p>
            </motion.div>

            <div className="position-relative">
                <Row className="g-4 align-items-stretch">
                    {/* Input Card */}
                    <Col lg={5}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-100"
                        >
                            <Card className="glass-card border-0 h-100 shadow-xl overflow-hidden" style={{ background: 'rgba(34, 211, 238, 0.03)' }}>
                                <div className="p-4 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center bg-accent bg-opacity-10">
                                    <Form.Select
                                        className="bg-transparent border-0 text-accent fw-bold p-0 shadow-none w-auto cursor-pointer"
                                        style={{ fontSize: '1rem' }}
                                        value={sourceLang}
                                        onChange={(e) => setSourceLang(e.target.value)}
                                    >
                                        {TASKS.map(lang => (
                                            <option key={lang.code} value={lang.code} className="bg-dark text-light">{lang.name}</option>
                                        ))}
                                    </Form.Select>
                                    {text && (
                                        <Button
                                            variant="link"
                                            className="p-0 text-accent opacity-75 hover-opacity-100 transition-all text-decoration-none small"
                                            onClick={() => setText('')}
                                        >
                                            <RotateCcw size={16} />
                                        </Button>
                                    )}
                                </div>
                                <Card.Body className="p-4">
                                    <Form.Control
                                        as="textarea"
                                        rows={7}
                                        placeholder="Enter content..."
                                        className="bg-transparent text-light border-0 p-0 shadow-none fs-5 lh-base"
                                        style={{ resize: 'none', minHeight: '280px' }}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                    <div className="mt-4 d-flex justify-content-between align-items-center">
                                        <span className="text-accent small opacity-50 fw-medium">{text.length} Characters</span>
                                        <Button
                                            className="gradient-btn px-4 py-2 rounded-3 border-0 fw-bold shadow-lg d-flex align-items-center gap-2"
                                            onClick={handleTranslate}
                                            disabled={loading || !text.trim()}
                                        >
                                            {loading ? <Spinner size="sm" /> : <>Translate <ArrowRight size={18} /></>}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>

                    {/* Swap Column (Responsive) */}
                    <Col lg={2} className="d-flex align-items-center justify-content-center py-2 py-lg-0">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={swapLanguages}
                            disabled={sourceLang === 'auto'}
                            className="btn rounded-circle p-3 gradient-btn text-white shadow-glow border-0 d-flex align-items-center justify-content-center"
                            style={{ width: 56, height: 56 }}
                        >
                            <ArrowLeftRight size={24} />
                        </motion.button>
                    </Col>

                    {/* Output Card */}
                    <Col lg={5}>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-100"
                        >
                            <Card className="glass-card border-0 h-100 shadow-xl overflow-hidden" style={{ background: 'rgba(14, 165, 233, 0.03)' }}>
                                <div className="p-4 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center bg-primary bg-opacity-10">
                                    <Form.Select
                                        className="bg-transparent border-0 text-primary fw-bold p-0 shadow-none w-auto cursor-pointer"
                                        style={{ fontSize: '1rem' }}
                                        value={targetLang}
                                        onChange={(e) => setTargetLang(e.target.value)}
                                    >
                                        {TARGET_LANGS.map(lang => (
                                            <option key={lang.code} value={lang.code} className="bg-dark text-light">{lang.name}</option>
                                        ))}
                                    </Form.Select>
                                    {translatedText && (
                                        <Button
                                            variant="link"
                                            className="p-1 bg-primary bg-opacity-10 rounded-3 text-primary hover-glow"
                                            onClick={() => navigator.clipboard.writeText(translatedText)}
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    )}
                                </div>
                                <Card.Body className="p-4">
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="h-100 d-flex flex-column align-items-center justify-content-center gap-3 py-5"
                                            >
                                                <Spinner animation="grow" variant="primary" />
                                                <span className="text-primary small fw-bold tracking-widest">SMART PROCESSING...</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="content"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="h-100"
                                            >
                                                {translatedText ? (
                                                    <div className="fs-5 text-light lh-base h-100" style={{ whiteSpace: 'pre-wrap', minHeight: '280px' }}>
                                                        {translatedText}
                                                    </div>
                                                ) : (
                                                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-primary opacity-20 py-5" style={{ minHeight: '280px' }}>
                                                        <Sparkles size={60} className="mb-3" />
                                                        <p className="fw-medium">Awaiting source...</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {error && <div className="mt-3 text-danger small bg-danger bg-opacity-10 p-2 rounded-3 border border-danger border-opacity-20">{error}</div>}
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default Translator;
