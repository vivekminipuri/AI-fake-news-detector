import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import { fetchHistory, fetchInsights } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Activity, BrainCircuit } from 'lucide-react';

const History = () => {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) return;
            try {
                const [histData, insightData] = await Promise.all([
                    fetchHistory(),
                    fetchInsights()
                ]);
                setHistory(histData);
                setInsights(insightData);
            } catch (error) {
                console.error("Failed to load history:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [currentUser]);

    if (!currentUser) {
        return <Container className="py-5 text-center text-light">Please login to view history.</Container>;
    }

    return (
        <Container className="py-5">
            {/* 1. Truth Profile Dashboard */}
            <div className="mb-5 animate-fade-in">
                <h2 className="gradient-text mb-4 d-flex align-items-center gap-2">
                    <BrainCircuit /> My Truth Profile
                </h2>

                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : insights ? (
                    <Card className="glass-card border-0 p-4">
                        <Row className="align-items-center">
                            <Col md={6} className="text-center text-md-start mb-4 mb-md-0">
                                <h3 className="text-light fw-bold display-6 mb-2">{insights.persona || "The Explorer"}</h3>
                                <p className="text-light-50 fs-5">"{insights.insight}"</p>
                                <div className="mt-4">
                                    <Badge bg={insights.fake_news_hit_rate > 50 ? "warning" : "success"} className="p-2 fs-6">
                                        Fake News Encounter Rate: {insights.fake_news_hit_rate}%
                                    </Badge>
                                </div>
                            </Col>
                            <Col md={6}>
                                <h5 className="text-secondary small text-uppercase fw-bold mb-3">Top Interests</h5>
                                {insights.interests?.map((item: any, idx: number) => (
                                    <div key={idx} className="mb-3">
                                        <div className="d-flex justify-content-between text-light small mb-1">
                                            <span>{item.topic}</span>
                                            <span>{item.percent}%</span>
                                        </div>
                                        <ProgressBar
                                            now={item.percent}
                                            variant={idx === 0 ? "primary" : idx === 1 ? "info" : "secondary"}
                                            style={{ height: '6px' }}
                                        />
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    </Card>
                ) : (
                    <p className="text-light-50">No insights available yet.</p>
                )}
            </div>

            {/* 2. Analysis History List */}
            <h4 className="text-light mb-4 d-flex align-items-center gap-2">
                <Activity size={20} /> recent Checks
            </h4>

            <div className="d-flex flex-column gap-3">
                {history.map((item: any) => (
                    <Card key={item.id} className="glass-card border-0 px-3 py-2">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div style={{ maxWidth: '70%' }}>
                                <div className="text-light fw-medium text-truncate mb-1">{item.content}</div>
                                <small className="text-light-50">
                                    {item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy • h:mm a') : 'Just now'}
                                </small>
                            </div>
                            <Badge
                                bg={item.verdict?.includes("Real") ? "success" : item.verdict?.includes("Fake") ? "danger" : "warning"}
                                className="px-3 py-2 rounded-pill"
                            >
                                {item.verdict}
                            </Badge>
                        </Card.Body>
                    </Card>
                ))}

                {!loading && history.length === 0 && (
                    <div className="text-center text-light-50 py-5">
                        <p>No history found. Start analyzing news to build your profile!</p>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default History;
