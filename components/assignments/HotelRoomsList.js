import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, Collapse, Table, Form } from 'react-bootstrap';
import { 
  FaHotel, 
  FaBed, 
  FaUsers, 
  FaChevronDown, 
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaPlus,
  FaStar
} from 'react-icons/fa';

const HotelRoomsList = ({ 
  assignments, 
  onManualAssign, 
  onRemoveAssignment, 
  onRoomUpdate 
}) => {
  const [expandedHotels, setExpandedHotels] = useState(new Set());
  const [editingRoom, setEditingRoom] = useState(null);

  // Toggle expansion d'un hôtel
  const toggleHotel = (hotelId) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(hotelId)) {
      newExpanded.delete(hotelId);
    } else {
      newExpanded.add(hotelId);
    }
    setExpandedHotels(newExpanded);
  };

  // Fonction pour obtenir la couleur selon le type de chambre
  const getRoomTypeColor = (roomType) => {
    const colors = {
      'VIP': 'danger',
      'Influenceur': 'warning',
      'Staff_Homme': 'dark',
      'Staff_Femme': 'dark',
      'Groupe_Homme': 'primary',
      'Groupe_Femme': 'info',
      'Mixed': 'success'
    };
    return colors[roomType] || 'secondary';
  };

  // Fonction pour formater le type de chambre
  const formatRoomType = (roomType) => {
    const formats = {
      'VIP': 'VIP',
      'Influenceur': 'Influenceur',
      'Staff_Homme': 'Staff ♂',
      'Staff_Femme': 'Staff ♀',
      'Groupe_Homme': 'Groupe ♂',
      'Groupe_Femme': 'Groupe ♀',
      'Mixed': 'Mixte'
    };
    return formats[roomType] || roomType;
  };

  return (
    <div>
      {assignments.map(assignment => (
        <Card key={assignment._id} className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => toggleHotel(assignment.hotelId._id)}
                >
                  {expandedHotels.has(assignment.hotelId._id) ? 
                    <FaChevronUp /> : <FaChevronDown />
                  }
                </Button>
                
                <div>
                  <h5 className="mb-0">
                    <FaHotel className="me-2 text-primary" />
                    {assignment.hotelId.name}
                  </h5>
                  <small className="text-muted">
                    {assignment.hotelId.address}
                    {assignment.hotelId.rating && (
                      <span className="ms-2">
                        {[...Array(assignment.hotelId.rating)].map((_, i) => (
                          <FaStar key={i} className="text-warning" size={12} />
                        ))}
                      </span>
                    )}
                  </small>
                </div>
              </div>

              <div className="d-flex gap-2">
                <Badge bg="primary" className="px-3 py-2">
                  {assignment.logicalRooms.length} chambres
                </Badge>
                <Badge bg="success" className="px-3 py-2">
                  {assignment.stats.totalAssigned}/{assignment.stats.totalCapacity} places
                </Badge>
                <Badge bg="info" className="px-3 py-2">
                  {assignment.stats.occupancyRate}% occupé
                </Badge>
              </div>
            </div>
          </Card.Header>

          <Collapse in={expandedHotels.has(assignment.hotelId._id)}>
            <Card.Body>
              {assignment.logicalRooms.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <FaBed size={48} className="mb-2" />
                  <p>Aucune chambre assignée dans cet hôtel</p>
                  <Button variant="primary" size="sm">
                    <FaPlus className="me-1" />
                    Créer une chambre
                  </Button>
                </div>
              ) : (
                <Row>
                  {assignment.logicalRooms.map(room => (
                    <Col md={6} lg={4} key={room.logicalRoomId} className="mb-3">
                      <Card className="h-100 border-2" style={{ 
                        borderColor: room.isFullyOccupied ? '#28a745' : '#dee2e6' 
                      }}>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{room.logicalRoomId}</strong>
                            {room.realRoomNumber && (
                              <div>
                                <small className="text-success">
                                  → Chambre {room.realRoomNumber}
                                </small>
                              </div>
                            )}
                          </div>
                          
                          <Badge bg={getRoomTypeColor(room.roomType)}>
                            {formatRoomType(room.roomType)}
                          </Badge>
                        </Card.Header>

                        <Card.Body>
                          <div className="mb-2">
                            <small className="text-muted">
                              <FaBed className="me-1" />
                              {room.bedCount} lit(s) • {room.maxCapacity} places max
                            </small>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small>Occupants:</small>
                              <Badge bg={room.isFullyOccupied ? 'success' : 'secondary'}>
                                {room.assignedClients.length}/{room.maxCapacity}
                              </Badge>
                            </div>
                            
                            {room.assignedClients.length > 0 ? (
                              <div className="small">
                                {room.assignedClients.map((assignedClient, index) => {
                                  // Note: Ici on devrait avoir les données du client peuplées
                                  const client = assignedClient.clientId;
                                  if (!client || typeof client === 'string') {
                                    return (
                                      <div key={index} className="text-muted">
                                        Client {assignedClient.clientId}
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div key={client._id} className="d-flex justify-content-between align-items-center border-bottom py-1">
                                      <div>
                                        <strong>{client.firstName} {client.lastName}</strong>
                                        <br />
                                        <small className="text-muted">
                                          {client.gender} • {client.clientType}
                                          {assignedClient.assignmentType === 'manual' && 
                                            <Badge bg="primary" size="sm" className="ms-1">M</Badge>
                                          }
                                        </small>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => onRemoveAssignment(client._id)}
                                        title="Retirer de cette chambre"
                                      >
                                        <FaTrash />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center text-muted py-2">
                                <em>Chambre vide</em>
                              </div>
                            )}
                          </div>

                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="flex-fill"
                              onClick={() => setEditingRoom(room)}
                            >
                              <FaEdit className="me-1" />
                              Éditer
                            </Button>
                            
                            {!room.realRoomNumber && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                title="Assigner numéro réel"
                              >
                                #
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Collapse>
        </Card>
      ))}

      {assignments.length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <FaHotel size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Aucun hôtel avec assignations</h5>
            <p className="text-muted">
              Les hôtels apparaîtront ici une fois que des clients y seront assignés.
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default HotelRoomsList;
