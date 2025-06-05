import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ 
  message = "Chargement...", 
  size = "lg",
  variant = "primary",
  center = true,
  overlay = false 
}) => {
  const content = (
    <div className={`d-flex align-items-center ${center ? 'justify-content-center' : ''}`}>
      <Spinner animation="border" size={size} variant={variant} className="me-2" />
      <span>{message}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          {content}
        </div>
        <style jsx>{`
          .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: 8px;
          }
          
          .loading-content {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={center ? 'text-center py-4' : ''}>
      {content}
    </div>
  );
};

export default LoadingSpinner;