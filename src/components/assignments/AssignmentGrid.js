import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Badge, Button, Modal, ListGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const AssignmentGrid = ({ assignments, hotels, clients }) => {
  const {
    assignClient,
    unassignClient,
    selectedClients,
    selectedRooms,
    selectClients,
    selectRooms,
    isClientSelected,
    isRoomSelected,
    addNotification,
    validation
  } = useAssignmentContext();

  const [showRoomDetails, setShowRoomDetails] = useState(null);
  const [draggedClient, setDraggedClient] = useState(null);

  // Organiser les données pour l'affichage
  const organizedData = useMemo(() => {
    const hotelData = hotels.map(hotel => {
      const hotelAssignment = assignments.find(a => a.hotelId._id === hotel._id);
      
      return {
        hotel,
        assignment: hotelAssignment,
        rooms: hotelAssignment ? hotelAssignment.logicalRooms : [],
        totalCapacity: hotel.totalCapacity || 0,
        assignedClients: hotelAssignment ? 
          hotelAssignment.logicalRooms.reduce((total, room) => 
            total + room.assignedClients.length, 0
          ) : 0
      };
    });

    return hotelData;
  }, [assignments, hotels]);

  // Clients non assignés
  const unassignedClients = useMemo(() => {
    const assignedClientIds = new Set();
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => {
          assignedClientIds.add(ac.clientId._id);
        });
      });
    });

    return clients.filter(client => !assignedClientIds.has(client._id));
  }, [assignments, clients]);

  // Gestion du drag and drop
  const handleDragStart = (start) => {
    const clientId = start.draggableId;
    const client = clients.find(c => c._id === clientId);
    setDraggedClient(client);
  };

  const handleDragEnd = async (result) => {
    setDraggedClient(null);

    if (!result.destination) return;

    const clientId = result.draggableId;
    const destinationId = result.destination.droppableId;

    // Parse destination (format: hotel_hotelId_room_roomId)
    const [, hotelId, , roomId] = destinationId.split('_');

    if (result.source.droppableId !== destinationId) {
      await assignClient(clientId, hotelId, roomId);
    }
  };

  // Gestion des clics
  const handleClientClick = (clientId, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-sélection
      const newSelection = isClientSelected(clientId)
        ? selectedClients.filter(id => id !== clientId)
        : [...selectedClients, clientId];
      selectClients(newSelection);
    } else {
      selectClients([clientId]);
    }
  };

  const handleRoomClick = (roomId, event) => {
    if (event.ctrlKey || event.metaKey) {
      const newSelection = isRoomSelected(roomId)
        ? selectedRooms.filter(id => id !== roomId)
        : [...selectedRooms, roomId];
      selectRooms(newSelection);
    } else {
      selectRooms([roomId]);
    }
  };

  const handleUnassign = async (clientId) => {
    await unassignClient(clientId);
  };

  const getClientTypeIcon = (type) => {
    const icons = {
      'VIP': 'fas fa-star text-warning',
      'Influenceur': 'fas fa-users text-info',
      'Staff': 'fas fa-user-tie text-secondary',
      'Groupe': 'fas fa-users text-primary',
      'Solo': 'fas fa-user text-muted'
    };
    return icons[type] || 'fas fa-user text-muted';
  };

  const getClientBadgeVariant = (type) => {
    const variants = {
      'VIP': 'warning',
      'Influenceur': 'info',
      'Staff': 'secondary',
      'Groupe': 'primary',
      'Solo': 'light'
    };
    return variants[type] || 'light';
  };

  const getRoomStatusColor = (room) => {
    const occupancy = room.assignedClients.length;
    const capacity = room.capacity;
    
    if (occupancy === 0) return 'border-secondary';
    if (occupancy > capacity) return 'border-danger';
    if (occupancy === capacity) return 'border-success';
    return 'border-warning';
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="assignment-grid p-3">
        {/* Section des clients non assignés */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0">
              <i className="fas fa-users me-2"></i>
              Clients non assignés
              <Badge bg="secondary" className="ms-2">
                {unassignedClients.length}
              </Badge>
            </h5>
            {unassignedClients.length > 0 && (
              <Button 
                size="sm" 
                variant="outline-primary"
                onClick={() => selectClients(unassignedClients.map(c => c._id))}
              >
                Tout sélectionner
              </Button>
            )}
          </div>
          
          <Droppable droppableId="unassigned" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`unassigned-clients ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
              >
                <div className="d-flex flex-wrap gap-2">
                  {unassignedClients.map((client, index) => (
                    <Draggable 
                      key={client._id} 
                      draggableId={client._id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`client-card ${snapshot.isDragging ? 'dragging' : ''} ${
                            isClientSelected(client._id) ? 'selected' : ''
                          }`}
                          onClick={(e) => handleClientClick(client._id, e)}
                        >
                          <div className="client-info">
                            <div className="d-flex align-items-center">
                              <i className={`${getClientTypeIcon(client.clientType)} me-2`}></i>
                              <div>
                                <div className="client-name">
                                  {client.firstName} {client.lastName}
                                </div>
                                <div className="client-details small text-muted">
                                  {client.clientType}
                                  {client.groupName && ` • ${client.groupName}`}
                                  <span className="ms-1">
                                    <i className={`fas fa-${client.gender === 'Homme' ? 'male' : 'female'}`}></i>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
                
                {unassignedClients.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-check-circle fa-2x mb-2"></i>
                    <div>Tous les clients sont assignés !</div>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>

        {/* Grille des hôtels */}
        <Row className="g-3">
          {organizedData.map((hotelData) => (
            <Col key={hotelData.hotel._id} lg={6} xl={4}>
              <Card className={`hotel-card h-100 ${getRoomStatusColor({ 
                assignedClients: Array(hotelData.assignedClients), 
                capacity: hotelData.totalCapacity 
              })}`}>
                <Card.Header className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-1">
                      <i className="fas fa-hotel me-2"></i>
                      {hotelData.hotel.name}
                    </h6>
                    <div className="small text-muted">
                      {hotelData.hotel.address}
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge 
                      bg={hotelData.assignedClients >= hotelData.totalCapacity ? 'success' : 'secondary'}
                    >
                      {hotelData.assignedClients}/{hotelData.totalCapacity}
                    </Badge>
                  </div>
                </Card.Header>

                <Card.Body className="p-2">
                  {hotelData.rooms && hotelData.rooms.length > 0 ? (
                    <div className="rooms-grid">
                      {hotelData.rooms.map((room) => (
                        <Droppable 
                          key={room.roomId} 
                          droppableId={`hotel_${hotelData.hotel._id}_room_${room.roomId}`}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`room-card ${getRoomStatusColor(room)} ${
                                snapshot.isDraggingOver ? 'drag-over' : ''
                              } ${isRoomSelected(room.roomId) ? 'selected' : ''}`}
                              onClick={(e) => handleRoomClick(room.roomId, e)}
                            >
                              <div className="room-header">
                                <div className="d-flex align-items-center justify-content-between">
                                  <span className="room-name">
                                    <i className="fas fa-bed me-1"></i>
                                    {room.roomNumber || `Chambre ${room.roomId.slice(-4)}`}
                                  </span>
                                  <div className="room-capacity">
                                    <Badge 
                                      bg={room.assignedClients.length > room.capacity ? 'danger' : 
                                          room.assignedClients.length === room.capacity ? 'success' : 'secondary'}
                                    >
                                      {room.assignedClients.length}/{room.capacity}
                                    </Badge>
                                  </div>
                                </div>
                                {room.roomType && (
                                  <div className="small text-muted">
                                    {room.roomType}
                                  </div>
                                )}
                              </div>

                              <div className="room-clients">
                                {room.assignedClients.map((assignedClient, index) => (
                                  <Draggable 
                                    key={assignedClient.clientId._id}
                                    draggableId={assignedClient.clientId._id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`assigned-client ${snapshot.isDragging ? 'dragging' : ''} ${
                                          isClientSelected(assignedClient.clientId._id) ? 'selected' : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleClientClick(assignedClient.clientId._id, e);
                                        }}
                                      >
                                        <div className="d-flex align-items-center justify-content-between">
                                          <div className="flex-grow-1">
                                            <div className="client-name small">
                                              <i className={`${getClientTypeIcon(assignedClient.clientId.clientType)} me-1`}></i>
                                              {assignedClient.clientId.firstName} {assignedClient.clientId.lastName}
                                            </div>
                                            {assignedClient.clientId.groupName && (
                                              <div className="group-name text-muted" style={{ fontSize: '0.7rem' }}>
                                                {assignedClient.clientId.groupName}
                                              </div>
                                            )}
                                          </div>
                                          <div className="client-actions">
                                            <Button
                                              size="sm"
                                              variant="outline-danger"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnassign(assignedClient.clientId._id);
                                              }}
                                              title="Désassigner"
                                            >
                                              <i className="fas fa-times"></i>
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>

                              {/* Indicateur de capacité et avertissements */}
                              {room.assignedClients.length > room.capacity && (
                                <div className="capacity-warning">
                                  <i className="fas fa-exclamation-triangle text-danger me-1"></i>
                                  <small className="text-danger">Surréservation</small>
                                </div>
                              )}

                              {room.assignedClients.length > 0 && (
                                <div className="room-actions mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline-info"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowRoomDetails(room);
                                    }}
                                  >
                                    <i className="fas fa-info-circle me-1"></i>
                                    Détails
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      <i className="fas fa-bed fa-2x mb-2"></i>
                      <div>Aucune chambre configurée</div>
                    </div>
                  )}
                </Card.Body>

                {/* Statistiques de l'hôtel */}
                <Card.Footer className="small">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      Occupation: {Math.round((hotelData.assignedClients / hotelData.totalCapacity) * 100)}%
                    </span>
                    <span className="text-muted">
                      {hotelData.rooms?.length || 0} chambre(s)
                    </span>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Modal de détails de chambre */}
        {showRoomDetails && (
          <Modal 
            show={!!showRoomDetails} 
            onHide={() => setShowRoomDetails(null)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <i className="fas fa-bed me-2"></i>
                Détails de la chambre {showRoomDetails.roomNumber || showRoomDetails.roomId.slice(-4)}
              </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <h6>Informations générales</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Type de chambre:</span>
                      <span>{showRoomDetails.roomType || 'Standard'}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Capacité:</span>
                      <span>{showRoomDetails.capacity} personne(s)</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Occupation actuelle:</span>
                      <span>
                        {showRoomDetails.assignedClients.length} personne(s)
                        {showRoomDetails.assignedClients.length > showRoomDetails.capacity && (
                          <Badge bg="danger" className="ms-2">Surréservation</Badge>
                        )}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                
                <Col md={6}>
                  <h6>Clients assignés</h6>
                  {showRoomDetails.assignedClients.length > 0 ? (
                    <ListGroup>
                      {showRoomDetails.assignedClients.map((assignedClient) => (
                        <ListGroup.Item 
                          key={assignedClient.clientId._id}
                          className="d-flex align-items-center justify-content-between"
                        >
                          <div>
                            <div className="d-flex align-items-center">
                              <i className={`${getClientTypeIcon(assignedClient.clientId.clientType)} me-2`}></i>
                              <div>
                                <div>{assignedClient.clientId.firstName} {assignedClient.clientId.lastName}</div>
                                <small className="text-muted">
                                  {assignedClient.clientId.clientType}
                                  {assignedClient.clientId.groupName && ` • ${assignedClient.clientId.groupName}`}
                                </small>
                              </div>
                            </div>
                          </div>
                          <Badge bg={getClientBadgeVariant(assignedClient.clientId.clientType)}>
                            {assignedClient.clientId.clientType}
                          </Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      Aucun client assigné
                    </div>
                  )}
                </Col>
              </Row>

              {/* Avertissements et recommandations */}
              {validation && (
                <div className="mt-3">
                  {validation.warnings
                    .filter(warning => warning.roomId === showRoomDetails.roomId)
                    .map((warning, index) => (
                      <Alert key={index} variant="warning" className="small mb-2">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {warning.message}
                      </Alert>
                    ))
                  }
                </div>
              )}
            </Modal.Body>
            
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowRoomDetails(null)}>
                Fermer
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        .assignment-grid {
          min-height: 600px;
        }
        
        .unassigned-clients {
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 1rem;
          min-height: 100px;
          transition: all 0.2s ease;
        }
        
        .unassigned-clients.drag-over {
          border-color: #0d6efd;
          background: #e3f2fd;
        }
        
        .client-card {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 0.5rem;
          cursor: grab;
          transition: all 0.2s ease;
          min-width: 180px;
        }
        
        .client-card:hover {
          border-color: #0d6efd;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .client-card.selected {
          border-color: #0d6efd;
          background: #e3f2fd;
        }
        
        .client-card.dragging {
          transform: rotate(5deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .hotel-card {
          transition: all 0.2s ease;
        }
        
        .room-card {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s ease;
        }
        
        .room-card.drag-over {
          border-color: #0d6efd;
          background: #e3f2fd;
        }
        
        .room-card.selected {
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }
        
        .assigned-client {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          margin-bottom: 0.25rem;
          cursor: grab;
          transition: all 0.2s ease;
        }
        
        .assigned-client:hover {
          background: #e9ecef;
        }
        
        .assigned-client.selected {
          background: #e3f2fd;
          border: 1px solid #0d6efd;
        }
        
        .assigned-client.dragging {
          opacity: 0.5;
        }
        
        .capacity-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          margin-top: 0.5rem;
        }
        
        .client-name {
          font-weight: 500;
        }
        
        .client-details {
          font-size: 0.8rem;
        }
        
        .room-header {
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .rooms-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>
    </DragDropContext>
  );
};

export default AssignmentGrid;
