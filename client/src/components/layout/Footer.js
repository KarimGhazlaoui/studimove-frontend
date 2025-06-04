import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container>
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">
              &copy; 2024 StudiMove Hotel. Tous droits réservés.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              Système de gestion hôtelière v1.0.0
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;