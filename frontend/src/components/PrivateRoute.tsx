import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
