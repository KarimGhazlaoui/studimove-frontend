import React, { useState, useMemo } from 'react';
import { Card, ListGroup, Badge, Button, Form, Alert } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const HistoryPanel = () => {
  const { 
    assignmentHistory, 
    undoLastAction, 
    redoLastAction, 
    clearHistory,
    canUndo,
    canRedo
  } = useAssignmentContext();

  const [filterType, setFilterType] = useState('all');
  const [showDetails, setShowDetails] = useState({});

  // Filtrer l'historique
  const filteredHistory = useMemo(() => {
    if (filterType === 'all') return assignmentHistory;
    return assignmentHistory.filter(entry => entry.action === filterType);
  }, [assignmentHistory, filterType]);

  // Types d'actions disponibles
  const actionTypes = useMemo(() => {
    const types = [...new Set(assignmentHistory.map(entry => entry.action))];
    return types.sort();
  }, [assignmentHistory]);

  const getActionIcon = (action) => {
    const icons = {
      'assign': 'fas fa-plus-circle text-success',
      'unassign': 'fas fa-minus-circle text-danger',
      'move': 'fas fa-arrows-alt text-info',
      'swap': 'fas fa-exchange-alt text-warning',
      'create_room': 'fas fa-bed text-primary',
      'delete_room': 'fas fa-trash text-danger',
      'auto_assign': 'fas fa-magic text-purple',
      'bulk_assign': 'fas fa-layer-group text-info',
      'validation_fix': 'fas fa-wrench text-warning'
    };
    return icons[action] || 'fas fa-circle text-muted';
  };

  const getActionLabel = (action) => {
    const labels = {
      'assign': 'Assignation',
      'unassign': 'Désassignation',
      'move': 'Déplacement',
      'swap': 'Échange',
      'create_room': 'Création chambre',
      'delete_room': 'Suppression chambre',
      'auto_assign': 'Assignation automatique',
      'bulk_assign': 'Assignation en lot',
      'validation_fix': 'Correction validation'
    };
    return labels[action] || action;
  };

  const formatActionDescription = (entry) => {
    const { action, data, metadata } = entry;

    switch (action) {
      case 'assign':
        return `${data.clientName} assigné(e) à ${data.hotelName} - ${data.roomNumber}`;
      
      case 'unassign':
        return `${data.clientName} retiré(e) de ${data.hotelName} - ${data.roomNumber}`;
      
      case 'move':
        return `${data.clientName} déplacé(e) de ${data.fromHotel} - ${data.fromRoom} vers ${data.toHotel} - ${data.toRoom}`;
      
      case 'swap':
        return `Échange entre ${data.client1Name} et ${data.client2Name}`;
      
      case 'create_room':
        return `Chambre ${data.roomNumber} créée dans ${data.hotelName}`;
      
      case 'delete_room':
        return `Chambre ${data.roomNumber} supprimée de ${data.hotelName}`;
      
      case 'auto_assign':
        return `${data.assignedCount} client(s) assigné(s) automatiquement`;
      
      case 'bulk_assign':
        return `${data.count} client(s) assigné(s) en lot à ${data.hotelName}`;
      
      case 'validation_fix':
        return `Correction appliquée: ${data.fixDescription}`;
      
      default:
        return entry.description || 'Action inconnue';
    }
  };

  const toggleDetails = (entryId) => {
    setShowDetails(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  if (assignmentHistory.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <i className="fas fa-history fa-2x text-muted mb-2"></i>
          <div className="text-muted">Aucun historique d'actions</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">
            <i className="fas fa-history me-2"></i>
            Historique des actions
            <Badge bg="secondary" className="ms-2">
              {assignmentHistory.length}
            </Badge>
          </h6>
          
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-success"
              disabled={!canUndo}
              onClick={undoLastAction}
            >
              <i className="fas fa-undo me-1"></i>
              Annuler
            </Button>
            <Button
              size="sm"
              variant="outline-info"
              disabled={!canRedo}
              onClick={redoLastAction}
            >
              <i className="fas fa-redo me-1"></i>
              Refaire
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={clearHistory}
            >
              <i className="fas fa-trash me-1"></i>
              Effacer
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mt-2">
          <Form.Select
            size="sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">Toutes les actions</option>
            {actionTypes.map(type => (
              <option key={type} value={type}>
                {getActionLabel(type)}
              </option>
            ))}
          </Form.Select>
        </div>
      </Card.Header>

      <Card.Body className="p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <ListGroup variant="flush">
          {filteredHistory.slice().reverse().map((entry) => (
            <ListGroup.Item key={entry.id}>
              <div className="d-flex align-items-start">
                <div className="me-3 mt-1">
                  <i className={getActionIcon(entry.action)}></i>
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-1">
                        {getActionLabel(entry.action)}
                        {entry.metadata?.isUndo && (
                          <Badge bg="warning" className="ms-2">Annulé</Badge>
                        )}
                        {entry.metadata?.isRedo && (
                          <Badge bg="info" className="ms-2">Refait</Badge>
                        )}
                      </h6>
                      <p className="mb-1">{formatActionDescription(entry)}</p>
                    </div>
                    
                    <div className="text-end">
                      <div className="small text-muted">
                        {formatDistanceToNow(new Date(entry.timestamp), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </div>
                      {(entry.data || entry.metadata) && (
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => toggleDetails(entry.id)}
                          className="mt-1"
                        >
                          <i className={`fas fa-chevron-${showDetails[entry.id] ? 'up' : 'down'}`}></i>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Détails de l'action */}
                  {showDetails[entry.id] && (entry.data || entry.metadata) && (
                    <div className="mt-2 p-2 bg-light rounded">
                      {entry.data && (
                        <div className="mb-2">
                          <strong>Données:</strong>
                          <pre className="small mb-0 mt-1">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {entry.metadata && (
                        <div>
                          <strong>Métadonnées:</strong>
                          <div className="small mt-1">
                            {Object.entries(entry.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="fw-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.error && (
                        <Alert variant="danger" className="small mt-2 mb-0">
                          <strong>Erreur:</strong> {entry.error}
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Indicateur de réversibilité */}
                  <div className="mt-1">
                    {entry.reversible ? (
                      <Badge bg="success" className="small">Réversible</Badge>
                    ) : (
                      <Badge bg="secondary" className="small">Non réversible</Badge>
                    )}
                    
                    {entry.metadata?.duration && (
                      <Badge bg="info" className="small ms-1">
                        {entry.metadata.duration}ms
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>

      <Card.Footer className="bg-light">
        <div className="d-flex justify-content-between align-items-center small">
          <span>
            {filteredHistory.length !== assignmentHistory.length ? (
              <span>
                {filteredHistory.length} sur {assignmentHistory.length} action(s) affichée(s)
              </span>
            ) : (
              <span>
                {assignmentHistory.length} action(s) au total
              </span>
            )}
          </span>
          
          <div className="d-flex gap-2">
            <span className={canUndo ? 'text-success' : 'text-muted'}>
              <i className="fas fa-undo me-1"></i>
              {canUndo ? 'Annulation possible' : 'Rien à annuler'}
            </span>
            <span className={canRedo ? 'text-info' : 'text-muted'}>
              <i className="fas fa-redo me-1"></i>
              {canRedo ? 'Refaire possible' : 'Rien à refaire'}
            </span>
          </div>
        </div>
      </Card.Footer>

      <style jsx>{`
        .history-entry {
          transition: all 0.2s ease;
        }
        
        .history-entry:hover {
          background-color: #f8f9fa;
        }
        
        pre {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 0.25rem;
          padding: 0.5rem;
          font-size: 0.75rem;
          max-height: 150px;
          overflow-y: auto;
        }
      `}</style>
    </Card>
  );
};

export default HistoryPanel;
