import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Badge, Row, Col, Card } from 'react-bootstrap';
import { FaHandPaper, FaUser, FaHotel, FaBed, FaExclamationTriangle } from 'react-icons/fa';

const ManualAssignmentModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  selectedClient, 
  assignments, 
  clients, 
  eventId 
}) => {
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [createNewRoom, setCreateNewRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    roomType: 'Groupe_Homme',
    bedCount: 2,
    maxCapacity: 4
  });
  const [forceAssign, setForceAssign] = useState(false);

  // Réinitialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (show) {
      if (selectedClient) {
        setSelectedClientId(selectedClient._id);
      } else {
        setSelectedClientId('');
      }
      setSelectedHotel('');
      setSelectedRoom('');
      setCreateNewRoom(false);
      setForceAssign(false);
    }
  }, [show, selectedClient]);

  // Client sélectionné (soit passé en prop, soit sélectionné dans la modal)
  const currentClient = selectedClient || clients.find(c => c._id === selectedClientId);
  
  // Hôtel sélectionné
  const currentHotel = assignments.find(a => a.hotelId._id === selectedHotel);

  // Chambres disponibles dans l'hôtel sélectionné
  const availableRooms = currentHotel ? currentHotel.logicalRooms.filter(room => {
    if (createNewRoom) return false;
    
    // Vérifier si la chambre a de la place
    const hasSpace = room.assignedClients.length < room.maxCapacity;
    
    // Vérifier la compatibilité du type
    if (!currentClient) return hasSpace;
    
    const isCompatible = checkRoomCompatibility(currentClient, room);
    return hasSpace && isCompatible;
  }) : [];

  // Vérifier la compatibilité client/chambre
  const checkRoomCompatibility = (client, room) => {
    // VIP peut aller partout
    if (client.clientType === 'VIP') return true;
    
    // Influenceur peut aller partout sauf Staff
    if (client.clientType === 'Influenceur') return !room.roomType.startsWith('Staff_');
    
    // Staff va dans les chambres Staff du même genre
    if (client.clientType === 'Staff') {
      return room.roomType === `Staff_${client.gender}`;
    }
    
    // Groupe/Solo : même genre, pas VIP/Influenceur/Staff
    const validTypes = [`Groupe_${client.gender}`];
    return validTypes.includes(room.roomType);
  };

  // Déterminer le type de chambre suggéré
  const getSuggestedRoomType = (client) => {
    if (!client) return 'Groupe_Homme';
    
    switch (client.clientType) {
      case 'VIP': return 'VIP';
      case 'Influenceur': return 'Influenceur';
      case 'Staff': return `Staff_${client.gender}`;
      default: return `Groupe_${client.gender}`;
    }
  };

  // Mettre à jour le type de chambre suggéré quand le client change
  useEffect(() => {
    if (currentClient && createNewRoom) {
      setNewRoomData(prev => ({
        ...prev,
        roomType: getSuggestedRoomType(currentClient)
      }));
    }
  }, [currentClient, createNewRoom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedClientId || !selectedHotel) {
      alert('Veuillez sélectionner un client et un hôtel');
      return;
    }

    const assignmentData = {
      clientId: selectedClientId,
      hotelId: selectedHotel,
      eventId: eventId,
      forceAssign: forceAssign
    };

    if (createNewRoom) {
      // Créer une nouvelle chambre
      assignmentData.createNewRoom = true;
      assignmentData.newRoomData = newRoomData;
    } else {
      if (!selectedRoom) {
        alert('Veuillez sélectionner une chambre ou créer une nouvelle');
        return;
      }
      assignmentData.logicalRoomId = selectedRoom;
    }

    onConfirm(assignmentData);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaHandPaper className="me-2 text-primary" />
          Assignation Manuelle
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* SÉLECTION CLIENT */}
          {!selectedClient && (
            <Form.Group className="mb-3">
              <Form.Label>Sélectionner un client :</Form.Label>
              <Form.Select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
              >
                <option value="">-- Choisir un client --</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.firstName} {client.lastName} - {client.clientType} - {client.gender}
                    {client.groupName && ` (${client.groupName})`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* INFORMATIONS CLIENT */}
          {currentClient && (
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      <FaUser className="me-2" />
                      {currentClient.firstName} {currentClient.lastName}
                    </h6>
                    <div className="d-flex gap-2">
                      <Badge bg="primary">{currentClient.clientType}</Badge>
                      <Badge bg={currentClient.gender === 'Homme' ? 'info' : 'danger'}>
                        {currentClient.gender}
                      </Badge>
                      {currentClient.groupName && (
                        <Badge bg="secondary">{currentClient.groupName}</Badge>
                      )}
                    </div>
                  </div>
                  
                  {currentClient.assignment?.hotelId && (
                    <Alert variant="warning" className="mb-0 p-2">
                      <small>
                        <FaExclamationTriangle className="me-1" />
                        Déjà assigné
                      </small>
                    </Alert>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* SÉLECTION HÔTEL */}
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner un hôtel :</Form.Label>
            <Form.Select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              required
            >
              <option value="">-- Choisir un hôtel --</option>
              {assignments.map(assignment => (
                <option key={assignment.hotelId._id} value={assignment.hotelId._id}>
                  {assignment.hotelId.name} 
                  ({assignment.stats.totalAssigned}/{assignment.stats.totalCapacity} occupé)
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* OPTION NOUVELLE CHAMBRE */}
          {selectedHotel && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="createNewRoom"
                label="Créer une nouvelle chambre"
                checked={createNewRoom}
                onChange={(e) => setCreateNewRoom(e.target.checked)}
              />
            </Form.Group>
          )}

          {/* PARAMÈTRES NOUVELLE CHAMBRE */}
          {createNewRoom && currentClient && (
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Paramètres de la nouvelle chambre</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type de chambre :</Form.Label>
                      <Form.Select
                        value={newRoomData.roomType}
                        onChange={(e) => setNewRoomData(prev => ({ ...prev, roomType: e.target.value }))}
                      >
                        <option value="VIP">VIP</option>
                        <option value="Influenceur">Influenceur</option>
                        <option value="Staff_Homme">Staff Homme</option>
                        <option value="Staff_Femme">Staff Femme</option>
                        <option value="Groupe_Homme">Groupe Homme</option>
                        <option value="Groupe_Femme">Groupe Femme</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lits :</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="4"
                        value={newRoomData.bedCount}
                        onChange={(e) => setNewRoomData(prev => ({ 
                          ...prev, 
                          bedCount: parseInt(e.target.value) 
                        }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Capacité max :</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="8"
                        value={newRoomData.maxCapacity}
                        onChange={(e) => setNewRoomData(prev => ({ 
                          ...prev, 
                          maxCapacity: parseInt(e.target.value) 
                        }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* SÉLECTION CHAMBRE EXISTANTE */}
          {!createNewRoom && selectedHotel && (
            <Form.Group className="mb-3">
              <Form.Label>Sélectionner une chambre :</Form.Label>
              {availableRooms.length > 0 ? (
                <Form.Select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  required={!createNewRoom}
                >
                  <option value="">-- Choisir une chambre --</option>
                  {availableRooms.map(room => (
                    <option key={room.logicalRoomId} value={room.logicalRoomId}>
                      {room.logicalRoomId} - {room.roomType} 
                      ({room.assignedClients.length}/{room.maxCapacity} occupants)
                      {room.realRoomNumber && ` - Chambre ${room.realRoomNumber}`}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Alert variant="warning">
                  <FaExclamationTriangle className="me-2" />
                  Aucune chambre compatible disponible dans cet hôtel.
                  {currentClient && (
                    <div className="mt-2">
                      <small>
                        <strong>Client :</strong> {currentClient.clientType} - {currentClient.gender}
                        <br />
                        <strong>Chambres compatibles :</strong> {getSuggestedRoomType(currentClient)}
                      </small>
                    </div>
                  )}
                </Alert>
              )}
            </Form.Group>
          )}

          {/* FORCER L'ASSIGNATION */}
          {currentClient?.assignment?.hotelId && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="forceAssign"
                label="Forcer la réassignation (le client est déjà assigné)"
                checked={forceAssign}
                onChange={(e) => setForceAssign(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Le client sera retiré de son assignation actuelle.
              </Form.Text>
            </Form.Group>
          )}

          {/* APERÇU DE L'ASSIGNATION */}
          {currentClient && selectedHotel && (selectedRoom || createNewRoom) && (
            <Alert variant="info">
              <h6>Aperçu de l'assignation :</h6>
              <ul className="mb-0">
                <li><strong>Client :</strong> {currentClient.firstName} {currentClient.lastName}</li>
                <li><strong>Hôtel :</strong> {currentHotel?.hotelId.name}</li>
                <li><strong>Chambre :</strong> 
                  {createNewRoom ? 
                    `Nouvelle chambre (${newRoomData.roomType})` : 
                    availableRooms.find(r => r.logicalRoomId === selectedRoom)?.logicalRoomId
                  }
                </li>
                <li><strong>Type :</strong> Manuel</li>
              </ul>
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={!selectedClientId || !selectedHotel || (!selectedRoom && !createNewRoom)}
          >
            <FaHandPaper className="me-2" />
            Assigner Manuellement
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ManualAssignmentModal;
