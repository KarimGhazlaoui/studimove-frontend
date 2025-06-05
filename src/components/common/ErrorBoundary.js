import React from 'react';
import { Alert, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log de l'erreur (vous pouvez envoyer vers un service de logging)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-4">
          <Alert variant="danger">
            <Alert.Heading>
              <i className="fas fa-exclamation-triangle me-2"></i>
              Une erreur s'est produite
            </Alert.Heading>
            <p>
              Désolé, quelque chose s'est mal passé. L'équipe technique a été notifiée.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary className="mb-2">Détails techniques (développement uniquement)</summary>
                <div className="bg-light p-3 rounded">
                  <strong>Erreur:</strong>
                  <pre className="text-danger small mb-2">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                  <strong>Stack trace:</strong>
                  <pre className="text-muted small">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
            
            <hr />
            <div className="d-flex gap-2">
              <Button 
                variant="outline-danger"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo me-2"></i>
                Recharger la page
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={() => window.history.back()}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;