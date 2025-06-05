import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  ButtonGroup, 
  Dropdown,
  Modal,
  Form,
  Badge,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';
import { useQuickActions } from '../../contexts/AssignmentContext';

const AssignmentToolbar = () => {
  const {
    // État
    selectedClients,
    selectedRooms,
    showStatsPanel,
    showFiltersPanel,
    showHistoryPanel,
    
    // Actions
    toggleStatsPanel,
    toggleFiltersPanel,
    toggleHistoryPanel,
    clearSelections,
    performAutoAssignment,
    optimizeAssignments,
    resetAllAssignments,
    
    // Données
    clients,
    assignments,
    realtimeStats,
    validation,
    
    // État de chargement
    isLoading,
    canUndo,
    canRedo,
    undo,
    redo
  } = useAssignmentContext();

  const quickActions = useQuickActions();

  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [autoAssignOptions, setAutoAssignOptions] = useState({
    mode: 'smart', // 'smart', 'balance', 'optimize'
    respectPreferences: true,
    allowMixedRooms: false,
    prioritizeVIPs: true,
    groupStrategy: 'keep_together' // 'keep_together', 'separate_if_needed', 'optimize'
  });

  const handleAutoAssign = async () => {
    const result = await performAutoAssignment(autoAssignOptions);
    setShowAutoAssignModal(false);
    
    if (result.success) {
      // Les notifications sont gérées dans le contexte
    }
  };

  const handleOptimize = async () => {
    if (window.confirm('Optimiser les assignations actuelles ? Cette action peut déplacer certains clients.')) {
      await optimizeAssignments();
    }
  };

  const handleReset = async () => {
    if (window.confirm('Réinitialiser toutes les assignations ? Cette action est irréversible.')) {
      await resetAllAssignments();
    }
  };

  return (
    <>
      <div className="assignment-toolbar bg-light border-bottom">
        <Container fluid>
          <Row className="align-items-center py-2">
            {/* Actions principales */}
            <Col md={6}>
              <div className="d-flex align-items-center">
                {/* Actions d'assignation */}
                <ButtonGroup className="me-3">
                  <OverlayTrigger
                    overlay={<Tooltip>Assignation automatique intelligente</Tooltip>}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAutoAssignModal(true)}
                      disabled={isLoading || clients.length === 0}
                    >
                      <i className="fas fa-magic me-1"></i>
                      Auto-assigner
                    </Button>
                  </OverlayTrigger>

                  <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle 
                      split 
                      variant="primary" 
                      size="sm"
                      disabled={isLoading}
                    />
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => quickActions.quickAssignVIPs()}>
                        <i className="fas fa-star text-warning me-2"></i>
                        Assigner les VIPs
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => quickActions.quickAssignInfluencers()}>
                        <i className="fas fa-users text-info me-2"></i>
                        Assigner les Influenceurs
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => quickActions.quickAssignStaff()}>
                        <i className="fas fa-user-tie text-secondary me-2"></i>
                        Assigner le Staff
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => quickActions.reuniteSelectedGroups()}>
                        <i className="fas fa-users-line text-success me-2"></i>
                        Regrouper les groupes
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ButtonGroup>

                {/* Actions d'optimisation */}
                <ButtonGroup className="me-3">
                  <OverlayTrigger
                    overlay={<Tooltip>Optimiser les assignations existantes</Tooltip>}
                  >
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={handleOptimize}
                      disabled={isLoading || realtimeStats.assignedClients === 0}
                    >
                      <i className="fas fa-chart-line me-1"></i>
                      Optimiser
                    </Button>
                  </OverlayTrigger>

                  <OverlayTrigger
                    overlay={<Tooltip>Réinitialiser toutes les assignations</Tooltip>}
                  >
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleReset}
                      disabled={isLoading || realtimeStats.assignedClients === 0}
                    >
                      <i className="fas fa-undo me-1"></i>
                      Reset
                    </Button>
                  </OverlayTrigger>
                </ButtonGroup>

                {/* Historique */}
                <ButtonGroup className="me-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo || isLoading}
                    title="Annuler"
                  >
                    <i className="fas fa-undo"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo || isLoading}
                    title="Refaire"
                  >
                    <i className="fas fa-redo"></i>
                  </Button>
                </ButtonGroup>
              </div>
            </Col>

            {/* Sélections et panneaux */}
            <Col md={6}>
              <div className="d-flex align-items-center justify-content-end">
                {/* Informations de sélection */}
                {(selectedClients.length > 0 || selectedRooms.length > 0) && (
                  <div className="me-3">
                    {selectedClients.length > 0 && (
                      <Badge bg="primary" className="me-1">
                        {selectedClients.length} client(s)
                      </Badge>
                    )}
                    {selectedRooms.length > 0 && (
                      <Badge bg="info" className="me-1">
                        {selectedRooms.length} chambre(s)
                      </Badge>
                    )}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={clearSelections}
                      title="Effacer la sélection"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                )}

                {/* Contrôles des panneaux */}
                <ButtonGroup size="sm">
                  <Button
                    variant={showFiltersPanel ? 'secondary' : 'outline-secondary'}
                    onClick={toggleFiltersPanel}
                    title="Panneau de filtres"
                  >
                    <i className="fas fa-filter"></i>
                  </Button>
                  
                  <Button
                    variant={showStatsPanel ? 'secondary' : 'outline-secondary'}
                    onClick={toggleStatsPanel}
                    title="Panneau de statistiques"
                  >
                    <i className="fas fa-chart-bar"></i>
                  </Button>
                  
                  <Button
                    variant={showHistoryPanel ? 'secondary' : 'outline-secondary'}
                    onClick={toggleHistoryPanel}
                    title="Historique"
                  >
                    <i className="fas fa-history"></i>
                  </Button>
                </ButtonGroup>
              </div>
            </Col>
          </Row>

          {/* Barre de statut avec validation */}
          {validation && (validation.criticalIssues > 0 || validation.warnings.length > 0) && (
            <Row className="border-top pt-1">
              <Col>
                <div className="d-flex align-items-center justify-content-between text-sm">
                  <div className="d-flex align-items-center">
                    {validation.criticalIssues > 0 && (
                      <span className="text-danger me-3">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {validation.criticalIssues} erreur(s) critique(s)
                      </span>
                    )}
                    {validation.warnings.length > 0 && (
                      <span className="text-warning me-3">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {validation.warnings.length} avertissement(s)
                      </span>
                    )}
                  </div>
                  
                  <div className="text-muted">
                    Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* Modal d'assignation automatique */}
      <Modal 
        show={showAutoAssignModal} 
        onHide={() => setShowAutoAssignModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-magic me-2"></i>
            Assignation automatique
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mode d'assignation</Form.Label>
                  <Form.Select
                    value={autoAssignOptions.mode}
                    onChange={(e) => setAutoAssignOptions({
                      ...autoAssignOptions,
                      mode: e.target.value
                    })}
                  >
                    <option value="smart">Intelligent (recommandé)</option>
                    <option value="balance">Équilibrage des hôtels</option>
                    <option value="optimize">Optimisation maximale</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {autoAssignOptions.mode === 'smart' && 'Prend en compte toutes les préférences et contraintes'}
                    {autoAssignOptions.mode === 'balance' && 'Répartit équitablement entre les hôtels'}
                    {autoAssignOptions.mode === 'optimize' && 'Maximise la satisfaction globale'}
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stratégie pour les groupes</Form.Label>
                  <Form.Select
                    value={autoAssignOptions.groupStrategy}
                    onChange={(e) => setAutoAssignOptions({
                      ...autoAssignOptions,
                      groupStrategy: e.target.value
                    })}
                  >
                    <option value="keep_together">Garder ensemble</option>
                    <option value="separate_if_needed">Séparer si nécessaire</option>
                    <option value="optimize">Optimiser selon l'espace</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="respectPreferences"
                  label="Respecter les préférences clients"
                  checked={autoAssignOptions.respectPreferences}
                  onChange={(e) => setAutoAssignOptions({
                    ...autoAssignOptions,
                    respectPreferences: e.target.checked
                  })}
                  className="mb-2"
                />
                
                <Form.Check
                  type="checkbox"
                  id="prioritizeVIPs"
                  label="Prioriser les VIPs et Influenceurs"
                  checked={autoAssignOptions.prioritizeVIPs}
                  onChange={(e) => setAutoAssignOptions({
                    ...autoAssignOptions,
                    prioritizeVIPs: e.target.checked
                  })}
                  className="mb-2"
                />
              </Col>
              
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  id="allowMixedRooms"
                  label="Autoriser les chambres mixtes"
                  checked={autoAssignOptions.allowMixedRooms}
                  onChange={(e) => setAutoAssignOptions({
                    ...autoAssignOptions,
                    allowMixedRooms: e.target.checked
                  })}
                  className="mb-2"
                />
              </Col>
            </Row>

            {/* Aperçu des actions */}
            <div className="mt-4 p-3 bg-light rounded">
              <h6>Aperçu des actions prévues :</h6>
              <ul className="mb-0 small">
                <li>{realtimeStats.unassignedClients || 0} clients seront assignés</li>
                <li>Mode: {autoAssignOptions.mode === 'smart' ? 'Intelligent' : 
                         autoAssignOptions.mode === 'balance' ? 'Équilibrage' : 'Optimisation'}</li>
                <li>Groupes: {autoAssignOptions.groupStrategy === 'keep_together' ? 'Maintenus ensemble' :
                            autoAssignOptions.groupStrategy === 'separate_if_needed' ? 'Séparés si nécessaire' : 'Optimisés'}</li>
                {autoAssignOptions.prioritizeVIPs && <li>VIPs et Influenceurs priorisés</li>}
              </ul>
            </div>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAutoAssignModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAutoAssign}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Assignation en cours...
              </>
            ) : (
              <>
                <i className="fas fa-magic me-2"></i>
                Lancer l'assignation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AssignmentToolbar;
