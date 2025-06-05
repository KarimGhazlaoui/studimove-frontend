import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, Alert } from 'react-bootstrap';
import { FaHotel, FaPlus, FaMapMarkerAlt, FaStar, FaBed, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

const EventHotelAssignments = () => {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const [assignForm, setAssignForm] = useState({
    hotelId: '',
    availableRooms: [
      { bedCount: 4, quantity: 10, pricePerNight: 50 }
    ],
    notes: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchAvailableHotels();
  }, [eventId]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/event/${eventId}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Erreur lors du chargement des assignations');
      }
    } catch (error) {
      console.error('Erreur fetch assignments:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableHotels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/available-hotels/${eventId}`);
      const result = await response.json();
      
      if (result.success) {
        setAvailableHotels(result.data);
      }
    } catch (error) {
      console.error('Erreur fetch available hotels:', error);
    }
  };

  const handleAssignHotel = async (e) => {
    e.preventDefault();
    
    if (!assignForm.hotelId) {
      toast.error('Veuillez sélectionner un hôtel');
      return;
    }

    if (assignForm.availableRooms.length === 0) {
      toast.error('Veuillez ajouter au moins un type de chambre');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId,
          ...assignForm
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Hôtel assigné avec succès');
        setShowAssignModal(false);
        resetAssignForm();
        fetchAssignments();
        fetchAvailableHotels();
      } else {
        toast.error(result.message || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Erreur assign hotel:', error);
      toast.error('Erreur de connexion');
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${selectedAssignment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availableRooms: selectedAssignment.availableRooms,
          notes: selectedAssignment.notes
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Assignation mise à jour avec succès');
        setShowEditModal(false);
        setSelectedAssignment(null);
        fetchAssignments();
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur update assignment:', error);
      toast.error('Erreur de connexion');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Assignation supprimée avec succès');
        fetchAssignments();
        fetchAvailableHotels();
      } else {
        toast.error(result.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur delete assignment:', error);
      toast.error('Erreur de connexion');
    }
  };

  const resetAssignForm = () => {
    setAssignForm({
      hotelId: '',
      availableRooms: [
        { bedCount: 4, quantity: 10, pricePerNight: 50 }
      ],
      notes: ''
    });
  };

  // Fonctions pour gérer les packs de chambres
  const addRoomPack = (isEdit = false) => {
    const newRoom = { bedCount: 4, quantity: 1, pricePerNight: 50 };
    
    if (isEdit && selectedAssignment) {
      setSelectedAssignment(prev => ({
        ...prev,
        availableRooms: [...prev.availableRooms, { ...newRoom, assignedRooms: 0 }]
      }));
    } else {
      setAssignForm(prev => ({
        ...prev,
        availableRooms: [...prev.availableRooms, newRoom]
      }));
    }
  };

  const removeRoomPack = (index, isEdit = false) => {
    if (isEdit && selectedAssignment) {
      setSelectedAssignment(prev => ({
        ...prev,
        availableRooms: prev.availableRooms.filter((_, i) => i !== index)
      }));
    } else {
      setAssignForm(prev => ({
        ...prev,
        availableRooms: prev.availableRooms.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRoomPack = (index, field, value, isEdit = false) => {
    if (isEdit && selectedAssignment) {
      setSelectedAssignment(prev => ({
        ...prev,
        availableRooms: prev.availableRooms.map((room, i) => 
          i === index ? { ...room, [field]: value } : room
        )
      }));
    } else {
      setAssignForm(prev => ({
        ...prev,
        availableRooms: prev.availableRooms.map((room, i) => 
          i === index ? { ...room, [field]: value } : room
        )
      }));
    }
  };

  const calculateOccupancyRate = (assignment) => {
    const totalCapacity = assignment.availableRooms?.reduce((sum, room) => 
      sum + (room.quantity * room.bedCount), 0) || 0;
    const totalAssigned = assignment.availableRooms?.reduce((sum, room) => 
      sum + ((room.assignedRooms || 0) * room.bedCount), 0) || 0;
    
    if (totalCapacity === 0) return 0;
    return Math.round((totalAssigned / totalCapacity) * 100);
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

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="mb-2">
                <Button as={Link} to="/events" variant="outline-secondary" size="sm">
                  <FaArrowLeft className="me-1" /> Retour aux événements
                </Button>
              </div>
              <h2>
                <FaHotel className="me-2 text-primary" />
                Hôtels assignés
              </h2>
              <p className="text-muted">
                {data?.assignments[0]?.eventId?.name} - {data?.assignments[0]?.eventId?.city}, {data?.assignments[0]?.eventId?.country}
              </p>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowAssignModal(true)}
              disabled={availableHotels.length === 0}
            >
              <FaPlus className="me-2" />
              Assigner un hôtel
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistiques */}
      {data?.stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h3 className="text-primary">{data.stats.totalHotels}</h3>
                <p className="mb-0">Hôtels assignés</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <h3 className="text-success">{data.stats.totalCapacity}</h3>
                <p className="mb-0">Places totales</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <h3 className="text-info">{data.stats.totalAssigned}</h3>
                <p className="mb-0">Places assignées</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-warning">
              <Card.Body>
                <h3 className="text-warning">{data.stats.availableCapacity}</h3>
                <p className="mb-0">Places disponibles</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alerte si pas d'hôtels disponibles */}
      {availableHotels.length === 0 && data?.assignments?.length > 0 && (
        <Alert variant="info" className="mb-4">
          <strong>Info:</strong> Tous les hôtels disponibles sont déjà assignés à cet événement.
        </Alert>
      )}

      {/* Liste des assignations */}
      <Row>
        {data?.assignments?.map(assignment => (
          <Col key={assignment._id} lg={6} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">{assignment.hotelId.name}</h5>
                  <small className="text-muted">
                    <FaMapMarkerAlt className="me-1" />
                    {assignment.hotelId.address.city}
                  </small>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg={assignment.status === 'Active' ? 'success' : assignment.status === 'Complet' ? 'danger' : 'warning'}>
                    {assignment.status}
                  </Badge>
                  <div className="ms-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < assignment.hotelId.rating ? 'text-warning' : 'text-muted'}
                        size="0.8em"
                      />
                    ))}
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body>
                <div className="mb-3">
                  <strong>Configuration des chambres:</strong>
                  <Table size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Lits</th>
                        <th>Chambres</th>
                        <th>Assignées</th>
                        <th>Capacité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignment.availableRooms.map((room, idx) => (
                        <tr key={idx}>
                          <td>
                            <Badge bg="light" text="dark">
                              {room.bedCount} lits
                            </Badge>
                          </td>
                          <td>{room.quantity}</td>
                          <td className="text-primary">{room.assignedRooms || 0}</td>
                          <td className="text-success">
                            {room.quantity * room.bedCount} places
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Total: </strong>
                    <span className="text-success">{assignment.totalCapacity} places</span>
                    <br />
                    <small className="text-muted">
                      Taux d'occupation: {calculateOccupancyRate(assignment)}%
                    </small>
                  </div>
                </div>

                {assignment.notes && (
                  <div className="mt-2">
                    <small className="text-muted">
                      <strong>Notes:</strong> {assignment.notes}
                    </small>
                  </div>
                )}
              </Card.Body>

              <Card.Footer>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="flex-fill"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setShowEditModal(true);
                    }}
                  >
                    <FaEdit className="me-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    className="flex-fill"
                    as={Link}
                    to={`/assignments/${eventId}/hotel/${assignment._id}`}
                  >
                    <FaBed className="me-1" />
                    Clients
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteAssignment(assignment._id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Message si aucune assignation */}
      {data?.assignments?.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <FaHotel size={64} className="text-muted mb-3" />
            <h4 className="text-muted">Aucun hôtel assigné</h4>
            <p className="text-muted">Commencez par assigner des hôtels à cet événement</p>
            {availableHotels.length > 0 ? (
              <Button variant="primary" onClick={() => setShowAssignModal(true)}>
                <FaPlus className="me-2" />
                Assigner le premier hôtel
              </Button>
            ) : (
              <Alert variant="warning" className="mt-3">
                <strong>Attention:</strong> Aucun hôtel disponible. 
                <Link to="/hotels/new" className="ms-2">Créer un nouvel hôtel</Link>
              </Alert>
            )}
          </Col>
        </Row>
      )}

      {/* Modal d'assignation d'hôtel */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
        <Form onSubmit={handleAssignHotel}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaPlus className="me-2" />
              Assigner un hôtel
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
            {/* Sélection de l'hôtel */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Sélectionner l'hôtel *</Form.Label>
                  <Form.Select
                    value={assignForm.hotelId}
                    onChange={e => setAssignForm(prev => ({ ...prev, hotelId: e.target.value }))}
                    required
                  >
                    <option value="">-- Choisir un hôtel --</option>
                    {availableHotels.map(hotel => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name} - {hotel.address.city}
                        {hotel.rating > 0 && ` (${hotel.rating}⭐)`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Configuration des chambres par pack */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">
                  <FaBed className="me-1" />
                  Configuration des chambres par pack *
                </Form.Label>
                <Button 
                  type="button"
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => addRoomPack()}
                >
                  <FaPlus className="me-1" />
                  Ajouter un pack
                </Button>
              </div>

              {assignForm.availableRooms.map((room, index) => (
                <Card key={index} className="mb-2">
                  <Card.Body className="py-2">
                    <Row className="align-items-center">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="small mb-1">Lits par chambre</Form.Label>
                          <Form.Select
                            size="sm"
                            value={room.bedCount}
                            onChange={e => updateRoomPack(index, 'bedCount', parseInt(e.target.value))}
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                              <option key={num} value={num}>{num} lits</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="small mb-1">Nombre de chambres</Form.Label>
                          <Form.Control
                            type="number"
                            size="sm"
                            min="1"
                            max="999"
                            value={room.quantity}
                            onChange={e => updateRoomPack(index, 'quantity', parseInt(e.target.value))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="small mb-1">Prix/nuit (€)</Form.Label>
                          <Form.Control
                            type="number"
                            size="sm"
                            min="0"
                            step="0.01"
                            value={room.pricePerNight}
                            onChange={e => updateRoomPack(index, 'pricePerNight', parseFloat(e.target.value))}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <div className="text-center">
                          <small className="text-muted d-block">Capacité</small>
                          <Badge bg="success" className="d-block">
                            {room.quantity * room.bedCount} places
                          </Badge>
                        </div>
                      </Col>
                      <Col md={1}>
                        {assignForm.availableRooms.length > 1 && (
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeRoomPack(index)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}

              {/* Résumé total */}
              <Alert variant="info" className="mt-2">
                <strong>Résumé:</strong> {' '}
                {assignForm.availableRooms.reduce((sum, room) => sum + room.quantity, 0)} chambres au total, {' '}
                {assignForm.availableRooms.reduce((sum, room) => sum + (room.quantity * room.bedCount), 0)} places disponibles
              </Alert>
            </div>

            {/* Notes */}
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Notes (optionnel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={assignForm.notes}
                    onChange={e => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes sur cette assignation..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              <FaPlus className="me-1" />
              Assigner l'hôtel
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de modification d'assignation */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Form onSubmit={handleUpdateAssignment}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaEdit className="me-2" />
              Modifier l'assignation - {selectedAssignment?.hotelId?.name}
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
            {selectedAssignment && (
              <>
                {/* Configuration des chambres */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0">
                      <FaBed className="me-1" />
                      Configuration des chambres par pack
                    </Form.Label>
                    <Button 
                      type="button"
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => addRoomPack(true)}
                    >
                      <FaPlus className="me-1" />
                      Ajouter un pack
                    </Button>
                  </div>

                  {selectedAssignment.availableRooms.map((room, index) => (
                    <Card key={index} className="mb-2">
                      <Card.Body className="py-2">
                        <Row className="align-items-center">
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label className="small mb-1">Lits/chambre</Form.Label>
                              <Form.Select
                                size="sm"
                                value={room.bedCount}
                                onChange={e => updateRoomPack(index, 'bedCount', parseInt(e.target.value), true)}
                              >
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                                  <option key={num} value={num}>{num} lits</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label className="small mb-1">Chambres</Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                min="0"
                                value={room.quantity}
                                onChange={e => updateRoomPack(index, 'quantity', parseInt(e.target.value), true)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label className="small mb-1">Assignées</Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                min="0"
                                max={room.quantity}
                                value={room.assignedRooms || 0}
                                onChange={e => updateRoomPack(index, 'assignedRooms', parseInt(e.target.value), true)}
                                className="text-primary"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label className="small mb-1">Prix/nuit</Form.Label>
                              <Form.Control
                                type="number"
                                size="sm"
                                min="0"
                                step="0.01"
                                value={room.pricePerNight}
                                onChange={e => updateRoomPack(index, 'pricePerNight', parseFloat(e.target.value), true)}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <div className="text-center">
                              <small className="text-muted d-block">Capacité</small>
                              <Badge bg="success" className="d-block mb-1">
                                {room.quantity * room.bedCount}
                              </Badge>
                              <small className="text-primary">
                                Assignées: {(room.assignedRooms || 0) * room.bedCount}
                              </small>
                            </div>
                          </Col>
                          <Col md={2}>
                            {selectedAssignment.availableRooms.length > 1 && (
                              <Button
                                type="button"
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeRoomPack(index, true)}
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}

                  {/* Résumé de modification */}
                  <Alert variant="info" className="mt-2">
                    <Row>
                      <Col md={6}>
                        <strong>Total chambres:</strong> {selectedAssignment.availableRooms.reduce((sum, room) => sum + room.quantity, 0)}
                        <br />
                        <strong>Capacité totale:</strong> {selectedAssignment.availableRooms.reduce((sum, room) => sum + (room.quantity * room.bedCount), 0)} places
                      </Col>
                      <Col md={6}>
                        <strong>Chambres assignées:</strong> {selectedAssignment.availableRooms.reduce((sum, room) => sum + (room.assignedRooms || 0), 0)}
                        <br />
                        <strong>Places assignées:</strong> {selectedAssignment.availableRooms.reduce((sum, room) => sum + ((room.assignedRooms || 0) * room.bedCount), 0)} places
                      </Col>
                    </Row>
                  </Alert>
                </div>

                {/* Notes */}
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={selectedAssignment.notes || ''}
                        onChange={e => setSelectedAssignment(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes sur cette assignation..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              <FaEdit className="me-1" />
              Sauvegarder les modifications
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default EventHotelAssignments;