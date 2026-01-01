import { motion } from 'framer-motion';
import { AlertCircle, Shield, Target, Activity, Share2, Download } from 'lucide-react';
import { AnalysisResponse } from '../services/api';
import { Card, Row, Col, Badge } from 'react-bootstrap';

interface ResultProps {
    result: AnalysisResponse;
}

const AnalysisResult = ({ result }: ResultProps) => {
    const score = result.credibility_score;
    const isReliable = score >= 70;
    const isSuspicious = score < 50;

    const colorClass = isReliable ? "text-success" : isSuspicious ? "text-danger" : "text-warning";
    const variant = isReliable ? "success" : isSuspicious ? "danger" : "warning";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-100 mt-5"
        >
            <Card className="glass-card mb-4 border-0 overflow-hidden">
                {/* Status Bar */}
                <div className={`bg-${variant} bg-opacity-25 py-2 px-4 d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10`}>
                    <span className="small fw-bold tracking-wider text-uppercase d-flex align-items-center gap-2">
                        <Shield size={14} /> AI Security Scan Complete
                    </span>
                    <div className="d-flex gap-3">
                        <Share2 size={16} className="cursor-pointer opacity-50" />
                        <Download size={16} className="cursor-pointer opacity-50" />
                    </div>
                </div>

                <Card.Body className="p-4 p-md-5">
                    <Row className="g-5">
                        <Col lg={4} className="text-center">
                            <div className="position-relative d-inline-block p-4">
                                {/* Score Circle */}
                                <svg width="200" height="200" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                    <motion.circle
                                        cx="50" cy="50" r="45" fill="none"
                                        stroke={isReliable ? "#10B981" : isSuspicious ? "#EF4444" : "#F59E0B"}
                                        strokeWidth="6"
                                        strokeDasharray="283"
                                        initial={{ strokeDashoffset: 283 }}
                                        animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                <div className="position-absolute top-50 start-50 translate-middle text-center">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className={`${colorClass} display-3 fw-bold mb-0`}
                                    >
                                        {score}
                                    </motion.div>
                                    <div className="text-muted small fw-bold tracking-widest">CREDIBILITY</div>
                                </div>
                            </div>
                        </Col>

                        <Col lg={8}>
                            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                                <h2 className={`display-4 fw-bold mb-0 ${colorClass}`}>{result.verdict}</h2>
                                <Badge bg={variant} className={`bg-opacity-20 ${colorClass} py-2 px-3 border border-${variant} border-opacity-25 rounded-pill`}>
                                    {result.category || "General News"}
                                </Badge>
                            </div>

                            <div className="bg-dark bg-opacity-25 rounded-4 p-4 border border-white border-opacity-10 mb-4">
                                <h6 className="text-uppercase text-muted fw-bold d-flex align-items-center gap-2 mb-3">
                                    <Target size={16} className="text-info" /> Analysis Key Points
                                </h6>
                                <p className="fs-5 lh-base text-light mb-0" style={{ fontWeight: 300 }}>
                                    {result.explanation}
                                </p>
                            </div>

                            {result.verified_sources && result.verified_sources.length > 0 && (
                                <div className="d-flex align-items-center gap-3">
                                    <span className="text-muted small fw-bold">SOURCES:</span>
                                    <div className="d-flex flex-wrap gap-2">
                                        {result.verified_sources.map((src, i) => (
                                            <Badge key={i} bg="dark" className="border border-white border-opacity-10 fw-normal">
                                                {src}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row className="g-4">
                <Col md={6}>
                    <Card className="glass-card h-100 border-0">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <Activity size={20} className="text-secondary" /> Detailed Metrics
                            </h5>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2 small fw-bold">
                                    <span className="text-muted">Subjectivity Index</span>
                                    <span className="text-info">{Math.round((result.sentiment_analysis?.subjectivity || 0) * 100)}%</span>
                                </div>
                                <div className="progress bg-dark bg-opacity-50" style={{ height: 6 }}>
                                    <motion.div
                                        className="progress-bar bg-info"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(result.sentiment_analysis?.subjectivity || 0) * 100}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="d-flex justify-content-between mb-2 small fw-bold">
                                    <span className="text-muted">Emotional Polarity</span>
                                    <span className="text-primary">{Math.round(Math.abs(result.sentiment_analysis?.polarity || 0) * 100)}%</span>
                                </div>
                                <div className="progress bg-dark bg-opacity-50" style={{ height: 6 }}>
                                    <motion.div
                                        className="progress-bar bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.abs(result.sentiment_analysis?.polarity || 0) * 100}%` }}
                                        transition={{ duration: 1.5, delay: 0.7 }}
                                    />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {result.red_flags.length > 0 && (
                    <Col md={6}>
                        <Card className="glass-card h-100 border-0 bg-danger bg-opacity-10 border-danger border-opacity-10">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-danger">
                                    <AlertCircle size={20} /> Red Flags Detected
                                </h5>
                                <ul className="list-unstyled mb-0">
                                    {result.red_flags.map((flag, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1 + i * 0.1 }}
                                            className="d-flex align-items-start gap-2 mb-3 small"
                                        >
                                            <span className="text-danger mt-1">●</span>
                                            <span className="text-light">{flag}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </motion.div>
    );
};

export default AnalysisResult;
