import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { MessageSquare, Heart, Send, Plus, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPosts, createPost, addComment, likePost, BlogPost } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ["Politics", "Health", "Technology", "Entertainment", "Business", "General"];

const Community = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    // Form States
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [newTags, setNewTags] = useState('');
    const [newComment, setNewComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await getPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (e: React.MouseEvent, postId: string) => {
        e.stopPropagation(); // Prevent opening modal
        try {
            const updatedPost = await likePost(postId);
            setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const tags = newTags.split(',').map(t => t.trim()).filter(t => t);
            await createPost(newTitle, newContent, newCategory, tags);
            await loadPosts();
            setShowCreateModal(false);
            setNewTitle('');
            setNewContent('');
            setNewCategory('General');
            setNewTags('');
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost || !newComment.trim()) return;

        setActionLoading(true);
        try {
            const updatedPost = await addComment(selectedPost._id, newComment);
            // Update in local list
            setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
            setSelectedPost(updatedPost); // Update modal view
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment", error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h1 className="display-4 fw-bold mb-2">Community <span className="gradient-text">Hub</span></h1>
                    <p className="text-muted mb-0 fs-5">Join the discussion on the latest news veracity.</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="gradient-btn px-4 py-2 rounded-4 fw-bold d-flex align-items-center gap-2"
                >
                    <Plus size={20} /> New Topic
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <Row className="g-4">
                    <AnimatePresence>
                        {posts.map((post, idx) => (
                            <Col key={post._id || idx} md={12}>
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card
                                        className="glass-card h-100 border-0 cursor-pointer overflow-hidden p-1"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-2 rounded-pill small">
                                                    {post.category || "General"}
                                                </Badge>
                                                <div className="text-muted small d-flex align-items-center gap-1">
                                                    <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <h4 className="fw-bold mb-3 lh-sm text-light hover-text-primary transition-all">
                                                {post.title}
                                            </h4>

                                            <p className="text-muted mb-4 small line-clamp-3 lh-base">
                                                {post.content}
                                            </p>

                                            <div className="pt-3 border-top border-white border-opacity-5 d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="bg-secondary bg-opacity-20 rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                                                        <User size={14} className="text-secondary" />
                                                    </div>
                                                    <span className="small text-muted fw-medium">{post.author?.name || "Anonymous"}</span>
                                                </div>

                                                <div className="d-flex gap-3">
                                                    <div
                                                        className="d-flex align-items-center gap-1 text-muted transition-all hover-text-danger"
                                                        onClick={(e) => handleLike(e, post._id)}
                                                    >
                                                        <Heart
                                                            size={16}
                                                            className={post.liked_by?.includes(currentUser?.uid || '') ? "text-danger fill-danger" : ""}
                                                            fill={post.liked_by?.includes(currentUser?.uid || '') ? "currentColor" : "none"}
                                                        />
                                                        <span className="small">{post.likes}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-1 text-muted">
                                                        <MessageSquare size={16} />
                                                        <span className="small">{post.comments?.length || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </AnimatePresence>
                </Row>
            )}

            {/* Create Post Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered contentClassName="glass-card border-0">
                <Modal.Header closeButton closeVariant="white" className="border-bottom border-white border-opacity-10 py-4 px-4">
                    <Modal.Title className="fw-bold">Start a New <span className="gradient-text">Discussion</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleCreatePost}>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted small fw-bold tracking-wider">TOPIC TITLE</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter a compelling title..."
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="bg-dark bg-opacity-50 text-light border-0 py-3 rounded-3 shadow-inner"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted small fw-bold tracking-wider">CATEGORY</Form.Label>
                            <Form.Select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="bg-dark bg-opacity-50 text-light border-0 py-3 rounded-3 shadow-inner cursor-pointer"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted small fw-bold tracking-wider">CONTENT</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="What's on your mind?"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                className="bg-dark bg-opacity-50 text-light border-0 py-3 rounded-3 shadow-inner"
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="outline-light" onClick={() => setShowCreateModal(false)} className="rounded-4 px-4 border-white border-opacity-10">Cancel</Button>
                            <Button type="submit" className="gradient-btn rounded-4 px-4 border-0" disabled={actionLoading}>
                                {actionLoading ? <Spinner size="sm" animation="border" /> : "Publish Topic"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* View/Comment Modal */}
            <Modal show={!!selectedPost} onHide={() => setSelectedPost(null)} centered size="lg" contentClassName="glass-card border-0 overflow-hidden">
                {selectedPost && (
                    <>
                        <Modal.Header closeButton closeVariant="white" className="border-bottom border-white border-opacity-10 py-4 px-4 bg-dark bg-opacity-25">
                            <div className="w-100">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-1 rounded-pill small">
                                        {selectedPost.category || "General"}
                                    </Badge>
                                    <div className="text-muted small d-flex align-items-center gap-1">
                                        <Calendar size={12} /> {new Date(selectedPost.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <Modal.Title className="fw-bold fs-3 text-light">{selectedPost.title}</Modal.Title>
                            </div>
                        </Modal.Header>
                        <Modal.Body className="p-0">
                            <div className="p-4 p-md-5">
                                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-dark bg-opacity-25 rounded-4 border border-white border-opacity-5">
                                    <div className="bg-primary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 45, height: 45 }}>
                                        <User size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <div className="fw-bold text-light">{selectedPost.author?.name || "Anonymous User"}</div>
                                        <div className="text-muted small">Community Contributor</div>
                                    </div>
                                </div>

                                <p className="fs-5 lh-lg text-light opacity-75 mb-4" style={{ whiteSpace: 'pre-wrap', fontWeight: 300 }}>
                                    {selectedPost.content}
                                </p>
                            </div>

                            <div className="p-4 p-md-5 bg-dark bg-opacity-50 border-top border-white border-opacity-5">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <MessageSquare size={22} className="text-info" />
                                    Discussions
                                </h5>

                                <div className="mb-4 bg-dark bg-opacity-25 rounded-4 p-4 border border-white border-opacity-5">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Discussions ({selectedPost.comments?.length || 0})</h5>
                                        <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-1">Active Topic</Badge>
                                    </div>

                                    <div className="comment-thread pe-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {selectedPost.comments?.map((c, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="mb-3 p-3 bg-dark bg-opacity-25 rounded-4 border border-white border-opacity-5"
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="small text-info fw-bold">{c.username}</span>
                                                    <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="mb-0 small text-light opacity-75 lh-base">{c.content}</p>
                                            </motion.div>
                                        ))}
                                        {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                                            <div className="text-center py-5 text-muted">
                                                <MessageSquare size={40} className="opacity-10 mb-3" />
                                                <p>Be the first to share your thoughts!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Form onSubmit={handleAddComment}>
                                    <div className="d-flex gap-2 bg-dark bg-opacity-50 p-2 rounded-4 border border-white border-opacity-10 focus-within-primary transition-all">
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            placeholder="Add your comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="bg-transparent border-0 text-light shadow-none py-2 px-3"
                                            style={{ resize: 'none' }}
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            className="gradient-btn rounded-3 px-3 border-0"
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? <Spinner size="sm" animation="border" /> : <Send size={18} />}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </Container>
    );
};

export default Community;
