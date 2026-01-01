import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './contexts/AuthContext';
import History from './pages/History';
import About from './pages/About';
import Translator from './pages/Translator';
import ChatBot from './pages/ChatBot';
import Community from './pages/Community';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
    >
        {children}
    </motion.div>
);

function AppContent() {
    const location = useLocation();

    return (
        <Layout>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={
                        <PrivateRoute>
                            <PageTransition>
                                <Home />
                            </PageTransition>
                        </PrivateRoute>
                    } />
                    <Route path="/chatbot" element={
                        <PrivateRoute>
                            <PageTransition>
                                <ChatBot />
                            </PageTransition>
                        </PrivateRoute>
                    } />
                    <Route path="/community" element={
                        <PrivateRoute>
                            <PageTransition>
                                <Community />
                            </PageTransition>
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <PageTransition>
                                <Profile />
                            </PageTransition>
                        </PrivateRoute>
                    } />
                    <Route path="/history" element={
                        <PrivateRoute>
                            <PageTransition>
                                <History />
                            </PageTransition>
                        </PrivateRoute>
                    } />
                    <Route path="/translator" element={
                        <PrivateRoute>
                            <PageTransition>
                                <Translator />
                            </PageTransition>
                        </PrivateRoute>
                    } />
                    <Route path="/login" element={
                        <PageTransition>
                            <Login />
                        </PageTransition>
                    } />
                    <Route path="/signup" element={
                        <PageTransition>
                            <Signup />
                        </PageTransition>
                    } />
                    <Route path="/about" element={
                        <PageTransition>
                            <About />
                        </PageTransition>
                    } />
                </Routes>
            </AnimatePresence>
        </Layout>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;

