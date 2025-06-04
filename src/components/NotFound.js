import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <h1 className="display-1">404</h1>
      <h2>Page non trouvée</h2>
      <p className="text-muted mb-4">
        La page que vous recherchez n'existe pas.
      </p>
      <Link to="/" className="btn btn-primary">
        <FaHome className="me-2" />
        Retour à l'accueil
      </Link>
    </Container>
  );
};

export default NotFound;
