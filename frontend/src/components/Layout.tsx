import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

const Layout = ({ children }: { children?: React.ReactNode }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar
                expand="lg"
                variant="dark"
                fixed="top"
                className={`navbar-glass py-3 ${scrolled ? 'scrolled' : ''}`}
            >
                <Container>
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold fs-4">
                        <ShieldCheck size={32} className="text-primary" />
                        <span className="gradient-text">TruthLens AI</span>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto">
                            <Nav.Link as={Link} to="/" className={`mx-2 ${isActive('/') ? 'text-primary' : ''}`}>Analyze</Nav.Link>
                            <Nav.Link as={Link} to="/chatbot" className={`mx-2 ${isActive('/chatbot') ? 'text-primary' : ''}`}>AI Assistant</Nav.Link>
                            <Nav.Link as={Link} to="/community" className={`mx-2 ${isActive('/community') ? 'text-primary' : ''}`}>Community</Nav.Link>
                            <Nav.Link as={Link} to="/translator" className={`mx-2 ${isActive('/translator') ? 'text-primary' : ''}`}>Translator</Nav.Link>
                            <Nav.Link as={Link} to="/history" className={`mx-2 ${isActive('/history') ? 'text-primary' : ''}`}>History</Nav.Link>
                        </Nav>

                        <Nav>
                            {currentUser ? (
                                <NavDropdown
                                    title={
                                        <div className="d-inline-flex align-items-center gap-2 text-info">
                                            <div className="bg-info bg-opacity-25 rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                {currentUser.photoURL ? (
                                                    <img src={currentUser.photoURL} alt="User" className="rounded-circle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <UserIcon size={18} />
                                                )}
                                            </div>
                                            <span className="d-none d-lg-inline small fw-bold">
                                                {currentUser.displayName || 'User'}
                                            </span>
                                        </div>
                                    }
                                    id="profile-nav-dropdown"
                                    align="end"
                                    className="profile-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/profile" className="d-flex align-items-center gap-2 py-2">
                                        <UserIcon size={16} /> Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="d-flex align-items-center gap-2 py-2 text-danger">
                                        <LogOut size={16} /> Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <Nav.Link as={Link} to="/login" className="btn btn-primary rounded-pill px-4">Login</Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main className="flex-grow-1" style={{ paddingTop: '100px' }}>
                <Container>
                    {children || <Outlet />}
                </Container>
            </main>

            <footer className="border-top border-secondary py-4 mt-5 text-center text-muted small">
                <Container>
                    <p className="mb-0">© 2024 TruthLens AI. Built for Truth.</p>
                </Container>
            </footer>
        </div>
    );
};

export default Layout;
