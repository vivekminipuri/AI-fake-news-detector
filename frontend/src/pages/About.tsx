import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, BrainCircuit, Globe, CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <Container className="py-5">
            <div className="text-center mb-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="display-4 fw-bold gradient-text mb-3">How TruthLens Works</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: 700 }}>
                        We combine Google's massive Fact-Check database, verified mainstream news coverage,
                        and advanced LLM reasoning to give you a definitive verdict on any news story.
                    </p>
                </motion.div>
            </div>

            <Row className="g-4 mb-5">
                {steps.map((step, idx) => (
                    <Col md={6} lg={3} key={idx}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="h-100"
                        >
                            <Card className="glass-card h-100 border-0">
                                <Card.Body className="p-4 d-flex flex-column align-items-center text-center">
                                    <div className="mb-3 text-primary bg-white bg-opacity-10 p-3 rounded-circle d-inline-flex">
                                        <step.icon size={40} />
                                    </div>
                                    <h5 className="fw-bold mb-3 text-light">
                                        <span className="badge bg-primary rounded-circle me-2">{idx + 1}</span>
                                        {step.title}
                                    </h5>
                                    <p className="text-light-50 small mb-0">{step.desc}</p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-5"
            >
                <Card className="glass-card border-0 p-5 text-center">
                    <h3 className="text-light fw-bold mb-4">Our Technology Stack</h3>
                    <Row className="justify-content-center g-4">
                        <Col xs={6} md={3}>
                            <div className="p-3 border border-secondary rounded-3 bg-dark bg-opacity-25">Google Fact Check API</div>
                        </Col>
                        <Col xs={6} md={3}>
                            <div className="p-3 border border-secondary rounded-3 bg-dark bg-opacity-25">NewsAPI.org</div>
                        </Col>
                        <Col xs={6} md={3}>
                            <div className="p-3 border border-secondary rounded-3 bg-dark bg-opacity-25">Gemini 2.5 Flash</div>
                        </Col>
                        <Col xs={6} md={3}>
                            <div className="p-3 border border-secondary rounded-3 bg-dark bg-opacity-25">FastAPI & React</div>
                        </Col>
                    </Row>
                </Card>
            </motion.div>
        </Container>
    );
};

const steps = [
    {
        title: "Fact Check Search",
        desc: "We first query Google's dedicated Fact Check Tools to see if professional fact-checkers (Snopes, Reuters, etc.) have already debunked the claim.",
        icon: ShieldCheck
    },
    {
        title: "News Verification",
        desc: "We cross-reference the story against 50,000+ mainstream media sources. If a major event isn't reported by big outlets, it's likely fake.",
        icon: Globe
    },
    {
        title: "AI Analysis",
        desc: "Our AI Engine analyzes the text for clickbait patterns, emotional manipulation, and source credibility heuristics.",
        icon: BrainCircuit
    },
    {
        title: "Gemini Synthesis",
        desc: "Finally, Google Gemini synthesizes all this data into a clear, 2-sentence explanation of WHY the story is Real or Fake.",
        icon: CheckCircle
    }
];

export default About;
