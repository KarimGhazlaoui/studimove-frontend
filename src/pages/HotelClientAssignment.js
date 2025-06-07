import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaHotel, FaCheck, FaTimes, FaArrowLeft, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { clientService, hotelService, eventService } from '../services/api';

const HotelClientAssignment = () => {
  const { eventId, assignmentId } = useParams();
  const navigate = useNavigate();
  
  // États principaux
  const [event, setEvent] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [assignedClients, setAssignedClients] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  
  // États pour les modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // États pour les filtres
  const [availableFilter, setAvailableFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  useEffect(() => {
    if (eventId && assignmentId) {
      fetchAssignmentDetails();
      fetchAssignedClients();
      fetchAvailableClients();
    }
  }, [eventId, assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      // Récupérer les détails de l'événement
      const eventData = await eventService.getEvent(eventId);
      if (eventData.success) {
        setEvent(eventData.data);
      }

      // Récupérer les détails de l'hôtel
      const hotelData = await hotelService.getHotel(assignmentId);
      if (hotelData.success) {
        setHotel(hotelData.data);
      }
    } catch (error) {
      console.error('Erreur récupération détails:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const fetchAssignedClients = async () => {
    try {
      const data = await clientService.getAllClients({ 
        eventId: eventId,
        assignedHotel: assignmentId 
      });
      
      if (data.success) {
        setAssignedClients(data.data || []);
      }
    } catch (error) {
      console.error('Erreur récupération clients assignés:', error);
      toast.error('Erreur lors du chargement des clients assignés');
    }
  };

  const fetchAvailableClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients({ 
        eventId: eventId,
        unassigned: true 
      });
      
      if (data.success) {
        setAvailableClients(data.data || []);
      }
    } catch (error) {
      console.error('Erreur récupération clients disponibles:', error);
      toast.error('Erreur lors du chargement des clients disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClient = async (client) => {
    setSelectedClient(client);
    setShowAssignModal(true);
  };

  const confirmAssignClient = async () => {
    if (!selectedClient) return;
    
    setAssignmentLoading(true);
    try {
      const result = await clientService.updateClient(selectedClient._id, {
        assignedHotel: assignmentId,
        status: 'Assigné'
      });

      if (result.success) {
        toast.success(`${selectedClient.firstName} ${selectedClient.lastName} assigné(e) à ${hotel?.name}`);
        setShowAssignModal(false);
        setSelectedClient(null);
        
        // Rafraîchir les listes
        fetchAssignedClients();
        fetchAvailableClients();
      } else {
        toast.error(result.message || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur assignation:', error);
      toast.error('Erreur lors de l\'assignation du client');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleUnassignClient = async (client) => {
    setSelectedClient(client);
    setShowUnassignModal(true);
  };

  const confirmUnassignClient = async () => {
    if (!selectedClient) return;
    
    setAssignmentLoading(true);
    try {
      const result = await clientService.updateClient(selectedClient._id, {
        assignedHotel: null,
        status: 'En attente'
      });

      if (result.success) {
        toast.success(`${selectedClient.firstName} ${selectedClient.lastName} retiré(e) de ${hotel?.name}`);
        setShowUnassignModal(false);
        setSelectedClient(null);
        
        // Rafraîchir les listes
        fetchAssignedClients();
        fetchAvailableClients();
      } else {
        toast.error(result.message || 'Erreur lors de la désassignation');
      }
    } catch (error) {
      console.error('Erreur désassignation:', error);
      toast.error('Erreur lors de la désassignation du client');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const getClientTypeBadge = (type) => {
    const variants = {
      'Standard': 'info',
      'VIP': 'warning',
      'Influenceur': 'danger',
      'Staff': 'success'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const getGenderBadge = (gender) => {
    const variants = {
      'Homme': 'primary',
      'Femme': 'success'
    };
    return <Badge bg={variants[gender] || 'secondary'}>{gender}</Badge>;
  };

  const filteredAvailableClients = availableClients.filter(client => {
    if (availableFilter === 'all') return true;
    return client.clientType === availableFilter;
  });

  const filteredAssignedClients = assignedClients.filter(client => {
    if (assignedFilter === 'all') return true;
    return client.clientType === assignedFilter;
  });

  if (loading && !event && !hotel) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* En-tête */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                as={Link}
                to={`/events/${eventId}/hotels`}
                variant="outline-secondary"
                className="mb-2"
              >
                <FaArrowLeft className="me-2" />
                Retour aux assignations
              </Button>
              <h2 className="mb-1">
                <FaUsers className="me-2" />
                Assignation des clients
              </h2>
              {event && hotel && (
                <div className="text-muted">
                  <div>📅 <strong>{event.name}</strong> • {event.city}, {event.country}</div>
                  <div>🏨 <strong>{hotel.name}</strong> • {hotel.address}</div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Statistiques */}
      {hotel && (
        <Row className="mb-4">
          <Col>
            <Card className="bg-light">
              <Card.Body>
                <Row className="text-center">
                  <Col md={3}>
                    <h4 className="text-primary mb-0">{hotel.totalRooms || 0}</h4>
                    <small>Chambres totales</small>
                  </Col>
                  <Col md={3}>
                    <h4 className="text-success mb-0">{assignedClients.length}</h4>
                    <small>Clients assignés</small>
                  </Col>
                  <Col md={3}>
                    <h4 className="text-info mb-0">{availableClients.length}</h4>
                    <small>Clients disponibles</small>
                  </Col>
                  <Col md={3}>
                    <h4 className="text-warning mb-0">
                      {hotel.totalRooms ? Math.max(0, hotel.totalRooms - assignedClients.length) : '?'}
                    </h4>
                    <small>Places restantes</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        {/* Clients disponibles */}
        <Col md={6}>
          <Card>
            <Card.Header className="bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaUserPlus className="me-2" />
                  Clients disponibles ({filteredAvailableClients.length})
                </h5>
                <Form.Select
                  size="sm"
                  value={availableFilter}
                  onChange={(e) => setAvailableFilter(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">Tous types</option>
                  <option value="Standard">Standard</option>
                  <option value="VIP">VIP</option>
                  <option value="Influenceur">Influenceur</option>
                  <option value="Staff">Staff</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body className="p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredAvailableClients.length > 0 ? (
                <Table striped hover className="mb-0">
                  <tbody>
                    {filteredAvailableClients.map(client => (
                      <tr key={client._id}>
                        <td>
                          <div>
                            <strong>{client.firstName} {client.lastName}</strong>
                            <div className="small text-muted">
                              📞 {client.phone}
                              {client.groupName && (
                                <span className="ms-2">
                                  👥 {client.groupName} ({client.groupSize})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {getGenderBadge(client.gender)}
                        </td>
                        <td>
                          {getClientTypeBadge(client.clientType)}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleAssignClient(client)}
                            disabled={assignmentLoading}
                          >
                            <FaCheck className="me-1" />
                            Assigner
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FaUsers size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">Aucun client disponible</h6>
                  <p className="text-muted small">
                    {availableFilter !== 'all' 
                      ? 'Aucun client de ce type disponible'
                      : 'Tous les clients sont déjà assignés'
                    }
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Clients assignés */}
        <Col md={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaHotel className="me-2" />
                  Clients assignés ({filteredAssignedClients.length})
                </h5>
                <Form.Select
                  size="sm"
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">Tous types</option>
                  <option value="Standard">Standard</option>
                  <option value="VIP">VIP</option>
                  <option value="Influenceur">Influenceur</option>
                  <option value="Staff">Staff</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body className="p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredAssignedClients.length > 0 ? (
                <Table striped hover className="mb-0">
                  <tbody>
                    {filteredAssignedClients.map(client => (
                      <tr key={client._id}>
                        <td>
                          <div>
                            <strong>{client.firstName} {client.lastName}</strong>
                            <div className="small text-muted">
                              📞 {client.phone}
                              {client.groupName && (
                                <span className="ms-2">
                                  👥 {client.groupName} ({client.groupSize})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {getGenderBadge(client.gender)}
                        </td>
                        <td>
                          {getClientTypeBadge(client.clientType)}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleUnassignClient(client)}
                            disabled={assignmentLoading}
                          >
                            <FaTimes className="me-1" />
                            Retirer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FaHotel size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">Aucun client assigné</h6>
                  <p className="text-muted small">
                    {assignedFilter !== 'all' 
                      ? 'Aucun client de ce type assigné'
                      : 'Commencez par assigner des clients à cet hôtel'
                    }
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmation d'assignation */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaCheck className="me-2" />
            Confirmer l'assignation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && hotel && (
            <div className="text-center">
              <FaUserPlus size={48} className="text-success mb-3" />
              <h5>Assigner ce client ?</h5>
              <Alert variant="info" className="mt-3">
                <div><strong>Client :</strong> {selectedClient.firstName} {selectedClient.lastName}</div>
                <div><strong>Téléphone :</strong> {selectedClient.phone}</div>
                <div><strong>Type :</strong> {selectedClient.clientType}</div>
                {selectedClient.groupName && (
                  <div><strong>Groupe :</strong> {selectedClient.groupName} ({selectedClient.groupSize} pers.)</div>
                )}
                <hr />
                <div><strong>Hôtel :</strong> {hotel.name}</div>
                <div><strong>Adresse :</strong> {hotel.address}</div>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Annuler
          </Button>
          <Button
            variant="success"
            onClick={confirmAssignClient}
            disabled={assignmentLoading}
          >
            {assignmentLoading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Assignation...</span>
                </div>
                Assignation...
              </>
            ) : (
              <>
                <FaCheck className="me-2" />
                Confirmer l'assignation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation de désassignation */}
      <Modal show={showUnassignModal} onHide={() => setShowUnassignModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaTimes className="me-2" />
            Confirmer la désassignation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && hotel && (
            <div className="text-center">
              <FaUserMinus size={48} className="text-danger mb-3" />
              <h5>Retirer ce client ?</h5>
              <Alert variant="warning" className="mt-3">
                <div><strong>Client :</strong> {selectedClient.firstName} {selectedClient.lastName}</div>
                <div><strong>Actuellement assigné à :</strong> {hotel.name}</div>
                <hr />
                <p className="mb-0">
                  <strong>⚠️ Le client sera remis en liste d'attente</strong>
                </p>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUnassignModal(false)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={confirmUnassignClient}
            disabled={assignmentLoading}
          >
            {assignmentLoading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Désassignation...</span>
                </div>
                Désassignation...
              </>
            ) : (
              <>
                <FaTimes className="me-2" />
                Confirmer la désassignation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Alert si capacité dépassée */}
      {hotel && assignedClients.length > hotel.totalRooms && (
        <Alert variant="warning" className="mt-3">
          <strong>⚠️ Attention :</strong> Le nombre de clients assignés ({assignedClients.length}) 
          dépasse la capacité de l'hôtel ({hotel.totalRooms} chambres).
        </Alert>
      )}
    </Container>
  );
};

export default HotelClientAssignment;
