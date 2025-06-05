import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaRobot, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const AutoAssignmentModal = ({ show, onHide, onConfirm, loading, stats }) => {
  const [options, setOptions] = useState({
    preserveManual: true,
    forceReassign: false
  });

  const handleConfirm = () => {
    onConfirm(options);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRobot className="me-2 text-success" />
          Assignation Automatique
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* APERÇU DES STATISTIQUES */}
        <div className="mb-4">
          <h6>Aperçu actuel :</h6>
          <div className="d-flex gap-3 mb-3">
            <Badge bg="primary" className="px-3 py-2">
              {stats.totalClients} clients total
            </Badge>
            <Badge bg="success" className="px-3 py-2">
              {stats.assignedClients} déjà assignés
            </Badge>
            <Badge bg="warning" className="px-3 py-2">
              {stats.unassignedClients} à assigner
            </Badge>
          </div>
        </div>

        {/* ALGORITHME D'ASSIGNATION */}
        <Alert variant="info">
          <FaInfoCircle className="me-2" />
          <strong>Algorithme d'assignation intelligente :</strong>
          <ol className="mt-2 mb-0">
            <li><strong>Priorité VIP</strong> : Chambres privées pour les VIP</li>
            <li><strong>Influenceurs</strong> : Chambres de qualité</li>
            <li><strong>Groupes</strong> : Même hôtel, séparation par genre (sauf VIP mixtes)</li>
            <li><strong>Staff</strong> : Chambres dédiées par genre</li>
            <li><strong>Solos</strong> : Remplissage des chambres de groupe</li>
          </ol>
        </Alert>

        {/* OPTIONS */}
        <Form>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="preserveManual"
              label="Préserver les assignations manuelles existantes"
              checked={options.preserveManual}
              onChange={(e) => setOptions({ ...options, preserveManual: e.target.checked })}
            />
            <Form.Text className="text-muted">
              Les clients assignés manuellement ne seront pas réassignés automatiquement.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="forceReassign"
              label="Forcer la réassignation complète"
              checked={options.forceReassign}
              onChange={(e) => setOptions({ ...options, forceReassign: e.target.checked })}
            />
            <Form.Text className="text-muted">
              Réassigner tous les clients (sauf manuels si préservés) pour optimiser la répartition.
            </Form.Text>
          </Form.Group>

          {options.forceReassign && !options.preserveManual && (
            <Alert variant="warning">
              <FaExclamationTriangle className="me-2" />
              <strong>Attention :</strong> Cette action va réassigner TOUS les clients, 
              y compris ceux déjà assignés manuellement !
            </Alert>
          )}
        </Form>

        {/* RÈGLES IMPORTANTES */}
        <Alert variant="secondary">
          <h6>Règles importantes :</h6>
          <ul className="mb-0">
            <li>Les groupes <strong>mixtes</strong> (hommes + femmes) doivent être <strong>VIP</strong></li>
            <li>Les groupes normaux sont séparés par <strong>genre</strong></li>
            <li>Même <strong>hôtel</strong> garanti pour un groupe</li>
            <li>Les <strong>solos</strong> complètent les chambres existantes</li>
            <li>Capacité maximale : <strong>4 personnes par chambre</strong> (sauf VIP)</li>
          </ul>
        </Alert>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Annuler
        </Button>
        <Button 
          variant="success" 
          onClick={handleConfirm}
          disabled={loading || stats.unassignedClients === 0}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Assignation en cours...
            </>
          ) : (
            <>
              <FaRobot className="me-2" />
              Lancer l'assignation ({stats.unassignedClients} clients)
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AutoAssignmentModal;