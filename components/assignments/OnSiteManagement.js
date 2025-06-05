import React, { useState } from 'react';
import { Card, Row, Col, Table, Button, Form, Modal, Badge, Alert, InputGroup } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaKey, 
  FaMoneyBillWave, 
  FaEdit, 
  FaCheck, 
  FaTimes,
  FaExclamationTriangle,
  FaSearch
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OnSiteManagement = ({ assignments, eventId, onUpdate }) => {
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [realRoomNumber, setRealRoomNumber] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPaid, setDepositPaid] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHotel, setFilterHotel] = useState('all');

  // Obtenir tous les clients avec leurs assignations
  const getAllAssignedClients = () => {
    const allClients = [];
    
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(assignedClient => {
          const client = assignedClient.clientId;
          if (client && typeof client === 'object') {
            allClients.push({
              ...client,
              hotelName: assignment.hotelId.name,
              hotelId: assignment.hotelId._id,
              logicalRoomId: room.logicalRoomId,
              realRoomNumber: room.realRoomNumber,
              assignment: assignedClient,
              roomType: room.roomType,
              roomCapacity: room.maxCapacity,
              roomOccupants: room.assignedClients.length
            });
          }
        });
      });
    });

    return allClients;
  };

  // Filtrer les clients
  const filteredClients = getAllAssignedClients().filter(client => {
    const matchesSearch = !searchTerm || 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    
    const matchesHotel = filterHotel === 'all' || client.hotelId === filterHotel;
    
    return matchesSearch && matchesHotel;
  });

  // Assigner un numéro de chambre réel
  const handleSetRealRoom = async () => {
    if (!selectedAssignment || !realRoomNumber.trim()) {
      toast.error('Veuillez saisir un numéro de chambre');
      return;
    }

    try {
      await axios.post(`${API_URL}/assignments/set-real-room`, {
        hotelId: selectedAssignment.hotelId,
        logicalRoomId: selectedAssignment.logicalRoomId,
        realRoomNumber: realRoomNumber.trim(),
        eventId: eventId
      });

      toast.success('Numéro de chambre mis à jour');
      setShowRoomModal(false);
      setSelectedAssignment(null);
      setRealRoomNumber('');
      onUpdate();
    } catch (error) {
      console.error('Erreur mise à jour chambre:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  // Mettre à jour la caution
  const handleUpdateDeposit = async () => {
    if (!selectedClient) return;

    try {
      await axios.post(`${API_URL}/assignments/update-deposit`, {
        clientId: selectedClient._id,
        depositAmount: parseFloat(depositAmount) || 0,
        depositPaid: depositPaid,
        eventId: eventId
      });

      toast.success('Caution mise à jour');
      setShowDepositModal(false);
      setSelectedClient(null);
      setDepositAmount('');
      setDepositPaid(false);
      onUpdate();
    } catch (error) {
      console.error('Erreur mise à jour caution:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  // Statistiques sur place
  const onSiteStats = {
    totalAssigned: filteredClients.length,
    withRealRoom: filteredClients.filter(c => c.realRoomNumber).length,
    withoutRealRoom: filteredClients.filter(c => !c.realRoomNumber).length,
    depositsPaid: filteredClients.filter(c => c.onSiteData?.depositPaid).length,
    depositsUnpaid: filteredClients.filter(c => !c.onSiteData?.depositPaid).length
  };

  return (
    <div>
      {/* STATISTIQUES SUR PLACE */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h4 className="text-primary">{onSiteStats.totalAssigned}</h4>
              <small className="text-muted">Clients assignés</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-success">
            <Card.Body>
              <h4 className="text-success">{onSiteStats.withRealRoom}</h4>
              <small className="text-muted">Chambres attribuées</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h4 className="text-warning">{onSiteStats.withoutRealRoom}</h4>
              <small className="text-muted">Sans n° chambre</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-info">
            <Card.Body>
              <h4 className="text-info">{onSiteStats.depositsPaid}</h4>
              <small className="text-muted">Cautions payées</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-danger">
            <Card.Body>
              <h4 className="text-danger">{onSiteStats.depositsUnpaid}</h4>
              <small className="text-muted">Cautions impayées</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-dark">
            <Card.Body>
              <h4 className="text-dark">
                {onSiteStats.totalAssigned > 0 ? 
                  Math.round((onSiteStats.withRealRoom / onSiteStats.totalAssigned) * 100) : 0}%
              </h4>
              <small className="text-muted">Progression</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ALERTES */}
      {onSiteStats.withoutRealRoom > 0 && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>{onSiteStats.withoutRealRoom} clients</strong> n'ont pas encore de numéro de chambre réel assigné.
        </Alert>
      )}

      {/* FILTRES */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select
                value={filterHotel}
                onChange={(e) => setFilterHotel(e.target.value)}
              >
                <option value="all">Tous les hôtels</option>
                {assignments.map(assignment => (
                  <option key={assignment.hotelId._id} value={assignment.hotelId._id}>
                    {assignment.hotelId.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* TABLEAU GESTION SUR PLACE */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FaMapMarkerAlt className="me-2" />
            Gestion sur Place ({filteredClients.length} clients)
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Hôtel</th>
                  <th>Chambre Logique</th>
                  <th>Chambre Réelle</th>
                  <th>Type</th>
                  <th>Caution</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={`${client._id}-${client.logicalRoomId}`}>
                    <td>
                      <div>
                        <strong>{client.firstName} {client.lastName}</strong>
                        <br />
                        <small className="text-muted">
                          {client.phone}
                          {client.groupName && <><br />Groupe: {client.groupName}</>}
                        </small>
                      </div>
                    </td>
                    
                    <td>
                      <div>
                        <strong>{client.hotelName}</strong>
                        <br />
                        <small className="text-muted">
                          {client.roomOccupants}/{client.roomCapacity} occupants
                        </small>
                      </div>
                    </td>
                    
                    <td>
                      <Badge bg="secondary" className="px-2 py-1">
                        {client.logicalRoomId}
                      </Badge>
                    </td>
                    
                    <td>
                      {client.realRoomNumber ? (
                        <Badge bg="success" className="px-2 py-1">
                          <FaKey className="me-1" />
                          {client.realRoomNumber}
                        </Badge>
                      ) : (
                        <Badge bg="warning" className="px-2 py-1">
                          Non attribuée
                        </Badge>
                      )}
                    </td>
                    
                    <td>
                      <Badge 
                        bg={client.clientType === 'VIP' ? 'danger' : 
                            client.clientType === 'Influenceur' ? 'warning' : 'primary'}
                      >
                        {client.clientType}
                      </Badge>
                    </td>
                    
                    <td>
                      {client.onSiteData?.depositAmount ? (
                        <div>
                          <Badge bg={client.onSiteData.depositPaid ? 'success' : 'danger'}>
                            {client.onSiteData.depositPaid ? <FaCheck /> : <FaTimes />}
                          </Badge>
                          <br />
                          <small>{client.onSiteData.depositAmount}€</small>
                        </div>
                      ) : (
                        <Badge bg="secondary">Non définie</Badge>
                      )}
                    </td>
                    
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setSelectedAssignment({
                              hotelId: client.hotelId,
                              logicalRoomId: client.logicalRoomId,
                              currentRealRoom: client.realRoomNumber
                            });
                            setRealRoomNumber(client.realRoomNumber || '');
                            setShowRoomModal(true);
                          }}
                          title="Attribuer numéro de chambre"
                        >
                          <FaKey />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => {
                            setSelectedClient(client);
                            setDepositAmount(client.onSiteData?.depositAmount || '');
                            setDepositPaid(client.onSiteData?.depositPaid || false);
                            setShowDepositModal(true);
                          }}
                          title="Gérer caution"
                        >
                          <FaMoneyBillWave />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-4 text-muted">
              <FaMapMarkerAlt size={48} className="mb-2" />
              <p>Aucun client assigné trouvé avec les filtres actuels</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* MODAL ATTRIBUTION CHAMBRE RÉELLE */}
      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaKey className="me-2" />
            Attribuer Numéro de Chambre
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssignment && (
            <div>
              <p className="mb-3">
                <strong>Chambre logique :</strong> {selectedAssignment.logicalRoomId}
              </p>
              
              <Form.Group>
                <Form.Label>Numéro de chambre réel :</Form.Label>
                <Form.Control
                  type="text"
                  value={realRoomNumber}
                  onChange={(e) => setRealRoomNumber(e.target.value)}
                  placeholder="Ex: 201, A15, Suite Premium..."
                  autoFocus
                />
                <Form.Text className="text-muted">
                  Numéro de la chambre physique attribuée par l'hôtel
                </Form.Text>
              </Form.Group>

              {selectedAssignment.currentRealRoom && (
                <Alert variant="info" className="mt-3">
                  <small>
                    <strong>Numéro actuel :</strong> {selectedAssignment.currentRealRoom}
                  </small>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoomModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSetRealRoom}
            disabled={!realRoomNumber.trim()}
          >
            <FaKey className="me-2" />
            Attribuer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL GESTION CAUTION */}
      <Modal show={showDepositModal} onHide={() => setShowDepositModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMoneyBillWave className="me-2" />
            Gestion de la Caution
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <div>
              <p className="mb-3">
                <strong>Client :</strong> {selectedClient.firstName} {selectedClient.lastName}
                <br />
                <strong>Hôtel :</strong> {selectedClient.hotelName}
                <br />
                <strong>Chambre :</strong> {selectedClient.realRoomNumber || selectedClient.logicalRoomId}
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Montant de la caution (€) :</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Ex: 50.00"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="depositPaid"
                  label="Caution payée"
                  checked={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.checked)}
                />
              </Form.Group>

              {selectedClient.onSiteData?.depositAmount && (
                <Alert variant="info">
                  <small>
                    <strong>État actuel :</strong> {selectedClient.onSiteData.depositAmount}€ - 
                    {selectedClient.onSiteData.depositPaid ? ' Payée' : ' Non payée'}
                  </small>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDepositModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={handleUpdateDeposit}
          >
            <FaMoneyBillWave className="me-2" />
            Mettre à jour
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OnSiteManagement;
