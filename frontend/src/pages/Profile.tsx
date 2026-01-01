import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { User, Camera, Save, Edit2, Shield, Award, Zap, ChevronRight, Activity, Target, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateUserProfile, getUserStats, UserProfile, UserStats } from '../services/api';

const Profile = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [tempName, setTempName] = useState('');
    const [tempPhone, setTempPhone] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const [profileData, statsData] = await Promise.all([
                getProfile(),
                getUserStats()
            ]);
            setProfile(profileData);
            setStats(statsData);
            setTempName(profileData.name || '');
            setTempPhone(profileData.phone || '');
        } catch (error) {
            console.error("Failed to load profile", error);
            setMessage({ type: 'danger', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await updateUserProfile({ name: tempName, phone: tempPhone });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setEditMode(false);
            await loadProfile();
        } catch (error) {
            console.error("Failed to update profile", error);
            setMessage({ type: 'danger', text: 'Failed to update profile.' });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Container className="py-5 mt-4">
            <Row className="g-4">
                {/* Left Column: Avatar & Quick Info */}
                <Col lg={4}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-100"
                    >
                        <Card className="glass-card border-0 h-100 p-4 text-center overflow-hidden">
                            <div className="position-absolute top-0 start-0 w-100 h-25 bg-primary bg-opacity-10" />

                            <Card.Body className="position-relative pt-5">
                                <div className="position-relative d-inline-block mb-4">
                                    <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center text-white p-1 border border-primary border-opacity-25" style={{ width: 120, height: 120 }}>
                                        <div className="bg-primary bg-opacity-10 rounded-circle w-100 h-100 d-flex align-items-center justify-content-center">
                                            {profile?.name ? (
                                                <span className="display-4 fw-bold gradient-text">{profile.name.charAt(0).toUpperCase()}</span>
                                            ) : (
                                                <User size={60} className="text-primary" />
                                            )}
                                        </div>
                                    </div>
                                    <button className="position-absolute bottom-0 end-0 btn btn-primary rounded-circle p-2 shadow border border-2 border-dark transition-all hover-scale">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <h2 className="fw-bold mb-1 text-light">{profile?.name || "User Name"}</h2>
                                <p className="text-muted small mb-4">{profile?.email || currentUser?.email}</p>

                                <div className="d-flex justify-content-center gap-2 mb-4">
                                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-2 rounded-pill">
                                        <Shield size={12} className="me-1" /> Core Member
                                    </Badge>
                                    <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-10 px-3 py-2 rounded-pill">
                                        <Award size={12} className="me-1" /> Top Fact-Checker
                                    </Badge>
                                </div>

                                <div className="bg-dark bg-opacity-40 rounded-4 p-4 text-start border border-white border-opacity-5 mt-4">
                                    <h6 className="text-muted small fw-bold tracking-widest mb-3">ACCOUNT STATS</h6>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted small">Daily Streaks</span>
                                        <span className="text-info fw-bold d-flex align-items-center gap-1">
                                            <Zap size={14} /> {stats?.streak || '0 Days'}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Verification Rank</span>
                                        <span className="text-light fw-bold">{stats?.rank || '#N/A'}</span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>

                {/* Right Column: Settings & Details */}
                <Col lg={8}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card className="glass-card border-0 p-4 mb-4">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-5">
                                    <h4 className="fw-bold mb-0 d-flex align-items-center gap-2 text-light">
                                        <ChevronRight size={24} className="text-primary" />
                                        Profile Settings
                                    </h4>
                                    {!editMode ? (
                                        <Button
                                            onClick={() => setEditMode(true)}
                                            className="gradient-btn px-4 py-2 rounded-pill border-0 d-flex align-items-center gap-2"
                                        >
                                            <Edit2 size={16} /> Edit Profile
                                        </Button>
                                    ) : (
                                        <Button variant="outline-light" onClick={() => { setEditMode(false); loadProfile(); }} className="rounded-pill px-4 border-white border-opacity-10">
                                            Cancel
                                        </Button>
                                    )}
                                </div>

                                {message.text && (
                                    <Alert variant={message.type} className={`mb-4 border-0 bg-${message.type} bg-opacity-10 text-${message.type} d-flex align-items-center gap-2`}>
                                        <Shield size={18} /> {message.text}
                                    </Alert>
                                )}

                                <Form onSubmit={handleUpdate}>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted small fw-bold tracking-wider mb-2">FULL NAME</Form.Label>
                                                <div className="bg-dark bg-opacity-25 rounded-4 p-1 border border-white border-opacity-10">
                                                    <Form.Control
                                                        type="text"
                                                        value={tempName}
                                                        onChange={(e) => setTempName(e.target.value)}
                                                        readOnly={!editMode}
                                                        className="bg-transparent border-0 text-light py-3 px-3 shadow-none fw-medium"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="text-muted small fw-bold tracking-wider mb-2">PHONE NUMBER</Form.Label>
                                                <div className="bg-dark bg-opacity-25 rounded-4 p-1 border border-white border-opacity-10">
                                                    <Form.Control
                                                        type="tel"
                                                        value={tempPhone}
                                                        onChange={(e) => setTempPhone(e.target.value)}
                                                        readOnly={!editMode}
                                                        className="bg-transparent border-0 text-light py-3 px-3 shadow-none fw-medium"
                                                        placeholder="Not provided"
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="text-muted small fw-bold tracking-wider mb-2">EMAIL ADDRESS</Form.Label>
                                                <div className="bg-dark bg-opacity-10 rounded-4 p-1 border border-white border-opacity-5">
                                                    <Form.Control
                                                        type="email"
                                                        defaultValue={profile?.email || currentUser?.email || ''}
                                                        readOnly
                                                        className="bg-transparent border-0 text-muted py-3 px-3 shadow-none opacity-50"
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {editMode && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                                            <Button
                                                type="submit"
                                                className="w-100 py-3 fw-bold gradient-btn rounded-4 border-0 shadow-lg"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? <Spinner size="sm" animation="border" className="me-2" /> : <Save size={20} className="me-2" />}
                                                Save Profile Changes
                                            </Button>
                                        </motion.div>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Recent Activity Mini-Dashboard */}
                        <div className="mt-4 pt-2">
                            <h4 className="fw-bold mb-4 px-2 d-flex align-items-center gap-3">
                                <Activity size={24} className="text-secondary" />
                                Community Impact
                            </h4>
                            <Row className="g-4">
                                {[
                                    { label: 'Topics Shared', value: stats?.topics_shared.toString() || '0', color: 'primary', icon: Save },
                                    { label: 'Total Reactions', value: stats?.total_reactions.toString() || '0', color: 'danger', icon: Heart },
                                    { label: 'Avg Accuracy', value: stats?.avg_accuracy || '0%', color: 'success', icon: Target }
                                ].map((stat, i) => (stat &&
                                    <Col md={4} key={i}>
                                        <Card className="glass-card border-0 p-3 bg-opacity-10">
                                            <Card.Body className="p-2">
                                                <div className={`text-${stat.color} mb-2`}>
                                                    <stat.icon size={20} />
                                                </div>
                                                <h3 className="fw-bold mb-0 text-light">{stat.value}</h3>
                                                <div className="text-muted small fw-bold">{stat.label}</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
