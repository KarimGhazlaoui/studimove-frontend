import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal } from 'react-bootstrap';
import { FaBed, FaUsers, FaArrowLeft, FaUserPlus, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

const HotelClientAssignment = () => {
  const { eventId, assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [availableClients, setAvailableClients] = useState([]);
  const [assignedClients, setAssignedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchAssignmentDetails();
    fetchAvailableClients();
    fetchAssignedClients();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`);
      const result = await response.json();
      
      if (result.success) {
        setAssignment(result.data);
      } else {
        toast.error('Erreur lors du chargement de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur fetch assignment:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients?eventId=${eventId}&status=En_attente`);
      const result = await response.json();
      
      if (result.success) {
        setAvailableClients(result.data);
      }
    } catch (error) {
      console.error('Erreur fetch available clients:', error);
    }
  };

  const fetchAssignedClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients?eventId=${eventId}&assignedHotel=${assignment?.hotelId._id}`);
      const result = await response.json();
      
      if (result.success) {
        setAssignedClients(result.data);
      }
    } catch (error) {
      console.error('Erreur fetch assigned clients:', error);
    }
  };

  const handleAssignClients = async () => {
    if (selectedClients.length === 0) {
      toast.error('Veuillez sélectionner au moins un client');
      return;
    }

    if (!selectedRoom) {
      toast.error('Veuillez sélectionner un type de chambre');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clients/assign-to-hotel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientIds: selectedClients,
          hotelId: assignment.hotelId._id,
          assignmentId: assignmentId,
          roomType: selectedRoom
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${selectedClients.length} client(s) assigné(s) avec succès`);
        setShowAssignModal(false);
        setSelectedClients([]);
        setSelectedRoom(null);
        fetchAvailableClients();
        fetchAssignedClients();
        fetchAssignmentDetails();
      } else {
        toast.error(result.message || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur assign clients:', error);
      toast.error('Erreur de connexion');
    }
  };

  const handleClientSelection = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container className="text-center py-5">
        <div className="alert alert-danger">Assignation non trouvée</div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="mb-2">
                <Button 
                  as={Link} 
                  to={`/events/${eventId}/hotels`} 
                  variant="outline-secondary" 
                  size="sm"
                >
                  <FaArrowLeft className="me-1" /> Retour aux hôtels
                </Button>
              </div>
              <h2>
                <FaBed className="me-2 text-primary" />
                {assignment.hotelId.name}
              </h2>
              <p className="text-muted">
                {assignment.eventId.name} - Assignation des clients
              </p>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowAssignModal(true)}
              disabled={availableClients.length === 0}
            >
              <FaUserPlus className="me-2" />
              Assigner des clients
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistiques des chambres */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Configuration des chambres</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Type de chambre</th>
                    <th>Chambres disponibles</th>
                    <th>Chambres assignées</th>
                    <th>Capacité totale</th>
                    <th>Places assignées</th>
                    <th>Places libres</th>
                    <th>Taux d'occupation</th>
                  </tr>
                </thead>
                <tbody>
                  {assignment.availableRooms.map((room, index) => {
                    const totalCapacity = room.quantity * room.bedCount;
                    const assignedCapacity = (room.assignedRooms || 0) * room.bedCount;
                    const occupancyRate = totalCapacity > 0 ? (assignedCapacity / totalCapacity) * 100 : 0;
                    
                    return (
                      <tr key={index}>
                        <td>
                          <Badge bg="light" text="dark" className="me-1">
                            {room.bedCount} lits
                          </Badge>
                        </td>
                        <td>{room.quantity}</td>
                        <td className="text-primary">
                          <strong>{room.assignedRooms || 0}</strong>
                        </td>
                        <td className="text-success">
                          <strong>{totalCapacity}</strong>
                        </td>
                        <td className="text-info">
                          <strong>{assignedCapacity}</strong>
                        </td>
                        <td className="text-warning">
                          <strong>{totalCapacity - assignedCapacity}</strong>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{height: '20px'}}>
                              <div 
                                className={`progress-bar ${occupancyRate >= 100 ? 'bg-danger' : occupancyRate >= 80 ? 'bg-warning' : 'bg-success'}`}
                                style={{width: `${Math.min(occupancyRate, 100)}%`}}
                              ></div>
                            </div>
                            <small>{Math.round(occupancyRate)}%</small>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Clients assignés */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaUsers className="me-2" />
                Clients assignés ({assignedClients.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {assignedClients.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Sexe</th>
                      <th>Téléphone</th>
                      <th>Groupe</th>
                      <th>Date d'assignation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedClients.map(client => (
                      <tr key={client._id}>
                        <td>
                          <strong>{client.firstName} {client.lastName}</strong>
                        </td>
                        <td>
                          <Badge bg={
                            client.clientType === 'VIP' ? 'warning' :
                            client.clientType === 'Influenceur' ? 'info' :
                            client.clientType === 'Groupe' ? 'success' : 'secondary'
                          }>
                            {client.clientType}
                          </Badge>
                        </td>
                        <td>{client.gender}</td>
                        <td>{client.phone}</td>
                        <td>{client.groupName || '-'}</td>
                        <td>
                          {new Date(client.updatedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Button variant="outline-danger" size="sm">
                            Désassigner
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaUsers size={48} className="mb-3" />
                  <p>Aucun client assigné à cet hôtel</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal d'assignation de clients */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUserPlus className="me-2" />
            Assigner des clients - {assignment.hotelId.name}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {/* Sélection du type de chambre */}
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Type de chambre *</Form.Label>
                <Form.Select
                  value={selectedRoom || ''}
                  onChange={e => setSelectedRoom(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un type de chambre --</option>
                  {assignment.availableRooms
                    .filter(room => (room.quantity - (room.assignedRooms || 0)) > 0)
                    .map((room, index) => (
                      <option key={index} value={`${room.bedCount}_lits`}>
                        Chambres {room.bedCount} lits 
                        ({room.quantity - (room.assignedRooms || 0)} disponibles)
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Liste des clients disponibles */}
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>
                  Clients disponibles ({availableClients.length})
                  {selectedClients.length > 0 && (
                    <Badge bg="primary" className="ms-2">
                      {selectedClients.length} sélectionné(s)
                    </Badge>
                  )}
                </Form.Label>
                
                <div style={{maxHeight: '400px', overflowY: 'auto'}} className="border rounded p-2">
                  {availableClients.length > 0 ? (
                    availableClients.map(client => (
                      <div 
                        key={client._id} 
                        className={`p-2 border-bottom cursor-pointer ${
                          selectedClients.includes(client._id) ? 'bg-primary bg-opacity-10' : ''
                        }`}
                        onClick={() => handleClientSelection(client._id)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <Form.Check
                              type="checkbox"
                              checked={selectedClients.includes(client._id)}
                              onChange={() => handleClientSelection(client._id)}
                              label=""
                              className="me-2 d-inline"
                            />
                            <strong>{client.firstName} {client.lastName}</strong>
                            <Badge bg="secondary" className="ms-2">{client.gender}</Badge>
                            <Badge 
                              bg={
                                client.clientType === 'VIP' ? 'warning' :
                                client.clientType === 'Influenceur' ? 'info' :
                                client.clientType === 'Groupe' ? 'success' : 'light'
                              }
                              text={client.clientType === 'Solo' ? 'dark' : 'white'}
                              className="ms-1"
                            >
                              {client.clientType}
                            </Badge>
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">{client.phone}</small>
                            {client.groupName && (
                              <small className="text-info">Groupe: {client.groupName}</small>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <FaUsers size={32} className="mb-2" />
                      <p className="mb-0">Aucun client disponible</p>
                      <small>Tous les clients sont déjà assignés</small>
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Informations sur l'assignation */}
          {selectedClients.length > 0 && selectedRoom && (
            <Row className="mt-3">
              <Col>
                <div className="alert alert-info">
                  <h6>Résumé de l'assignation:</h6>
                  <ul className="mb-0">
                    <li><strong>{selectedClients.length}</strong> client(s) sélectionné(s)</li>
                    <li>Type de chambre: <strong>{selectedRoom.replace('_', ' ')}</strong></li>
                    <li>
                      Places nécessaires: <strong>{selectedClients.length}</strong>
                      {(() => {
                        const bedCount = parseInt(selectedRoom.split('_')[0]);
                        const roomsNeeded = Math.ceil(selectedClients.length / bedCount);
                        return ` (${roomsNeeded} chambre${roomsNeeded > 1 ? 's' : ''} nécessaire${roomsNeeded > 1 ? 's' : ''})`;
                      })()}
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssignClients}
            disabled={selectedClients.length === 0 || !selectedRoom}
          >
            <FaUserPlus className="me-1" />
            Assigner {selectedClients.length} client(s)
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HotelClientAssignment;
