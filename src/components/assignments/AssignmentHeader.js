import React from 'react';
import { Container, Row, Col, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const AssignmentHeader = ({ event, stats, validation }) => {
  const {
    viewMode,
    setViewMode,
    realtimeStats,
    isLoading,
    isSaving,
    saveAssignments,
    exportAssignments
  } = useAssignmentContext();

  const getStatusBadge = () => {
    const { assignedClients, totalClients } = stats;
    const percentage = totalClients > 0 ? Math.round((assignedClients / totalClients) * 100) : 0;
    
    if (percentage === 100) {
      return <Badge bg="success">Complet</Badge>;
    } else if (percentage >= 80) {
      return <Badge bg="warning">En cours</Badge>;
    } else if (percentage > 0) {
      return <Badge bg="info">Démarré</Badge>;
    } else {
      return <Badge bg="secondary">Non démarré</Badge>;
    }
  };

  const getValidationBadge = () => {
    if (validation.criticalIssues > 0) {
      return <Badge bg="danger">Erreurs critiques</Badge>;
    } else if (validation.warnings.length > 0) {
      return <Badge bg="warning">Avertissements</Badge>;
    } else if (stats.assignedClients > 0) {
      return <Badge bg="success">Valide</Badge>;
    }
    return null;
  };

  return (
    <div className="assignment-header bg-white border-bottom">
      <Container fluid>
        <Row className="align-items-center py-3">
          {/* Informations de l'événement */}
          <Col md={6}>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <i className="fas fa-calendar-alt fa-2x text-primary"></i>
              </div>
              <div>
                <h4 className="mb-1">
                  {event.name}
                  <span className="ms-2">
                    {getStatusBadge()}
                    {getValidationBadge() && (
                      <span className="ms-1">{getValidationBadge()}</span>
                    )}
                  </span>
                </h4>
                <div className="text-muted small">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {event.city}, {event.country}
                  <span className="mx-2">•</span>
                  <i className="fas fa-calendar me-1"></i>
                  {new Date(event.startDate).toLocaleDateString('fr-FR')} - {new Date(event.endDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </Col>

          {/* Statistiques rapides */}
          <Col md={3}>
            <div className="text-center">
              <div className="d-flex justify-content-center align-items-center mb-1">
                <div className="me-3">
                  <div className="h5 mb-0 text-primary">{stats.assignedClients}</div>
                  <div className="small text-muted">Assignés</div>
                </div>
                <div className="me-3">
                  <div className="h5 mb-0 text-info">{stats.totalClients}</div>
                  <div className="small text-muted">Total</div>
                </div>
                <div>
                  <div className="h5 mb-0 text-success">
                    {stats.totalClients > 0 ? Math.round((stats.assignedClients / stats.totalClients) * 100) : 0}%
                  </div>
                  <div className="small text-muted">Complété</div>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="progress" style={{ height: '4px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  style={{ 
                    width: `${stats.totalClients > 0 ? (stats.assignedClients / stats.totalClients) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </Col>

          {/* Contrôles */}
          <Col md={3}>
            <div className="d-flex justify-content-end align-items-center">
              {/* Sélecteur de vue */}
              <ButtonGroup className="me-2" size="sm">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('grid')}
                  title="Vue grille"
                >
                  <i className="fas fa-th"></i>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                  title="Vue liste"
                >
                  <i className="fas fa-list"></i>
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('timeline')}
                  title="Vue chronologique"
                >
                  <i className="fas fa-clock"></i>
                </Button>
              </ButtonGroup>

              {/* Actions principales */}
              <ButtonGroup size="sm">
                <Button
                  variant="outline-success"
                  onClick={() => saveAssignments()}
                  disabled={isSaving}
                  title="Sauvegarder"
                >
                  {isSaving ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-save"></i>
                  )}
                </Button>
                
                <Button
                  variant="outline-info"
                  onClick={() => exportAssignments('csv', event.name)}
                  disabled={isLoading}
                  title="Exporter"
                >
                  <i className="fas fa-download"></i>
                </Button>
              </ButtonGroup>
            </div>
          </Col>
        </Row>

        {/* Indicateurs de statut détaillés */}
        {(validation.criticalIssues > 0 || validation.warnings.length > 0) && (
          <Row className="border-top pt-2 pb-1">
            <Col>
              <div className="d-flex align-items-center text-sm">
                {validation.criticalIssues > 0 && (
                  <span className="me-3 text-danger">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    {validation.criticalIssues} erreur(s) critique(s)
                  </span>
                )}
                {validation.warnings.length > 0 && (
                  <span className="me-3 text-warning">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {validation.warnings.length} avertissement(s)
                  </span>
                )}
                <span className="text-muted">
                  Score de qualité: {Math.round(stats.qualityScore || 0)}/100
                </span>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default AssignmentHeader;
