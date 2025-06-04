import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <FaExclamationTriangle size={64} className="text-warning mb-4" />
      <h1>404 - Page non trouvée</h1>
      <p className="lead text-muted mb-4">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn btn-primary">
        <FaHome className="me-2" />
        Retour à l'accueil
      </Link>
    </Container>
  );
};

export default NotFound;