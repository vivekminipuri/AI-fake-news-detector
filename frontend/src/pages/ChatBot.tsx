import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { Send, User, Trash2, Cpu, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithBot } from '../services/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const ChatBot = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I am Veritas, your AI Media Literacy Assistant. Ask me about specific news, spotting fake news, or understanding logical fallacies. How can I verify the truth for you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialMount = useRef(true);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (initialMount.current) {
            initialMount.current = false;
            return;
        }
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const data = await chatWithBot(userMsg.content, history);
            const botMsg = { role: 'assistant' as const, content: data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting directly to my knowledge base right now. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'assistant', content: "Chat cleared. How else can I help you today?" }]);
    };

    return (
        <Container className="py-5 mt-4">
            <Row className="justify-content-center">
                <Col lg={10} xl={9}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header Section */}
                        <div className="d-flex justify-content-between align-items-end mb-4 px-3">
                            <div>
                                <h2 className="fw-bold mb-1 d-flex align-items-center gap-3 text-light">
                                    <div className="bg-primary bg-opacity-80 p-2 rounded-3 shadow-glow">
                                        <Cpu size={32} className="text-white" />
                                    </div>
                                    Veritas <span className="gradient-text">AI</span>
                                </h2>
                                <p className="text-muted small mb-0 opacity-75">Secure Cognitive Intelligence Agent</p>
                            </div>
                            <Button
                                variant="link"
                                onClick={clearChat}
                                className="text-muted p-0 text-decoration-none small d-flex align-items-center gap-1 hover-text-danger transition-all opacity-50 hover-opacity-100"
                            >
                                <Trash2 size={14} /> Clear History
                            </Button>
                        </div>

                        {/* Main Chat Interface */}
                        <Card className="glass-card border-0 overflow-hidden shadow-2xl"
                            style={{
                                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                            <Card.Body className="d-flex flex-column p-0" style={{ height: '650px' }}>
                                {/* Welcome Message / Status */}
                                <div className="bg-dark bg-opacity-60 border-bottom border-white border-opacity-5 px-4 py-3 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-accent rounded-circle shadow-glow" style={{ width: 8, height: 8 }} />
                                        <span className="text-accent small fw-bold tracking-widest" style={{ fontSize: '0.7rem' }}>KNOWLEDGE CORE SYNCED</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Badge bg="none" className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 rounded-pill px-3 py-1">Neural-v4</Badge>
                                        <Badge bg="none" className="bg-accent bg-opacity-10 text-accent border border-accent border-opacity-20 rounded-pill px-3 py-1">Secure-Gate</Badge>
                                    </div>
                                </div>

                                {/* Chat History */}
                                <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.03) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(34, 211, 238, 0.03) 0%, transparent 40%)'
                                    }}>
                                    <AnimatePresence initial={false}>
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={`d-flex mb-4 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                                            >
                                                <div className={`d-flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`} style={{ maxWidth: '85%' }}>
                                                    <div className={`flex-shrink-0 mt-1 d-flex align-items-center justify-content-center rounded-circle shadow-glow`}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            background: msg.role === 'user' ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' : 'linear-gradient(135deg, #1e293b, #0f172a)',
                                                            border: '2px solid rgba(255,255,255,0.1)'
                                                        }}>
                                                        {msg.role === 'user' ? <User size={18} className="text-white" /> : <MessageSquare size={18} className="text-white" />}
                                                    </div>
                                                    <div className={`p-3 px-4 rounded-4 shadow-lg border ${msg.role === 'user'
                                                        ? 'bg-primary bg-opacity-10 border-primary border-opacity-20 text-light'
                                                        : 'bg-dark bg-opacity-40 border-white border-opacity-10 text-light'
                                                        }`}
                                                        style={{
                                                            borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px'
                                                        }}>
                                                        <div className={`small fw-bold mb-1 opacity-50 tracking-widest ${msg.role === 'user' ? 'text-primary' : 'text-accent'}`}>
                                                            {msg.role === 'user' ? 'DIRECTIVE' : 'COGNITIVE OUTPUT'}
                                                        </div>
                                                        <p className="mb-0 lh-base" style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', fontWeight: 400 }}>{msg.content}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {loading && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex gap-3 mb-4">
                                            <div className="bg-accent bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center shadow-glow" style={{ width: 36, height: 36 }}>
                                                <Spinner animation="grow" size="sm" variant="info" />
                                            </div>
                                            <div className="p-3 px-4 rounded-4 bg-dark bg-opacity-40 border border-white border-opacity-10" style={{ borderRadius: '4px 20px 20px 20px' }}>
                                                <div className="d-flex gap-1 py-1">
                                                    <span className="dot-pulse bg-accent"></span>
                                                    <span className="dot-pulse bg-accent" style={{ animationDelay: '0.2s' }}></span>
                                                    <span className="dot-pulse bg-accent" style={{ animationDelay: '0.4s' }}></span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-dark bg-opacity-60 border-top border-white border-opacity-5">
                                    <Form onSubmit={handleSend}>
                                        <div className="position-relative d-flex align-items-center overflow-hidden rounded-4 border border-white border-opacity-10 focus-within-primary transition-all">
                                            <Form.Control
                                                type="text"
                                                placeholder="Ask Veritas anything..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                className="bg-dark bg-opacity-40 text-light border-0 py-3 ps-4 pe-5 shadow-none"
                                                disabled={loading}
                                                style={{ fontSize: '1.05rem', minHeight: '50px' }}
                                            />
                                            <Button
                                                type="submit"
                                                className="position-absolute end-0 me-3 p-2 rounded-3 border-0 gradient-btn shadow-lg d-flex align-items-center justify-content-center"
                                                style={{ width: 38, height: 38 }}
                                                disabled={loading || !input.trim()}
                                            >
                                                {loading ? <Spinner size="sm" /> : <Send size={18} />}
                                            </Button>
                                        </div>
                                        <div className="mt-3 d-flex justify-content-center gap-3">
                                            {['Fact Check URL', 'Debunk Claim', 'Verify Image Source'].map((hint) => (
                                                <button
                                                    key={hint}
                                                    type="button"
                                                    onClick={() => setInput(hint)}
                                                    className="btn btn-outline-dark btn-sm rounded-pill px-3 border-white border-opacity-10 text-muted hover-text-violet transition-all"
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {hint}
                                                </button>
                                            ))}
                                        </div>
                                    </Form>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
};

export default ChatBot;
