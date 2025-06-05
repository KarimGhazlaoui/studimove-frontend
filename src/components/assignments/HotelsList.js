import React, { useState, useMemo } from 'react';
import { Card, ListGroup, Badge, Button, Form, InputGroup, ProgressBar } from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const HotelsList = ({ hotels, assignments }) => {
  const {
    selectedRooms,
    selectRooms,
    isRoomSelected,
    assignClient,
    unassignClient
  } = useAssignmentContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOccupancy, setFilterOccupancy] = useState('all');

  // Données enrichies des hôtels
  const enrichedHotels = useMemo(() => {
    return hotels.map(hotel => {
      const assignment = assignments.find(a => a.hotelId._id === hotel._id);
      const rooms = assignment ? assignment.logicalRooms : [];
      
      const totalCapacity = hotel.totalCapacity || 0;
      const assignedClients = rooms.reduce((total, room) => 
        total + room.assignedClients.length, 0
      );
      
      const occupancyRate = totalCapacity > 0 ? (assignedClients / totalCapacity) * 100 : 0;
      
      return {
        ...hotel,
        assignment,
        rooms,
        totalCapacity,
        assignedClients,
        occupancyRate,
        availableCapacity: totalCapacity - assignedClients
      };
    });
  }, [hotels, assignments]);

  // Hôtels filtrés
  const filteredHotels = useMemo(() => {
    return enrichedHotels.filter(hotel => {
      const matchesSearch = !searchTerm || 
        `${hotel.name} ${hotel.address}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesOccupancy = true;
      if (filterOccupancy !== 'all') {
        const rate = hotel.occupancyRate;
        switch (filterOccupancy) {
          case 'empty':
            matchesOccupancy = rate === 0;
            break;
          case 'partial':
            matchesOccupancy = rate > 0 && rate < 100;
            break;
          case 'full':
            matchesOccupancy = rate >= 100;
            break;
          case 'overbook':
            matchesOccupancy = rate > 100;
            break;
        }
      }
      
      return matchesSearch && matchesOccupancy;
    });
  }, [enrichedHotels, searchTerm, filterOccupancy]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    return enrichedHotels.reduce((stats, hotel) => {
      stats.totalCapacity += hotel.totalCapacity;
      stats.totalAssigned += hotel.assignedClients;
      stats.totalRooms += hotel.rooms.length;
      
      if (hotel.occupancyRate === 0) stats.emptyHotels++;
      else if (hotel.occupancyRate >= 100) stats.fullHotels++;
      else stats.partialHotels++;
      
      return stats;
    }, {
      totalCapacity: 0,
      totalAssigned: 0,
      totalRooms: 0,
      emptyHotels: 0,
      partialHotels: 0,
      fullHotels: 0
    });
  }, [enrichedHotels]);

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

  const getOccupancyVariant = (rate) => {
    if (rate === 0) return 'secondary';
    if (rate < 50) return 'info';
    if (rate < 80) return 'warning';
    if (rate < 100) return 'primary';
    return 'success';
  };

  const getOccupancyBg = (rate) => {
    if (rate > 100) return 'danger';
    return getOccupancyVariant(rate);
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">
            <i className="fas fa-hotel me-2"></i>
            Hôtels
            <Badge bg="secondary" className="ms-2">
              {filteredHotels.length}
            </Badge>
          </h5>
          
          {selectedRooms.length > 0 && (
            <Badge bg="info">
              {selectedRooms.length} chambre(s) sélectionnée(s)
            </Badge>
          )}
        </div>

        {/* Statistiques globales */}
        <div className="small text-muted mt-2">
          <span className="me-3">
            <i className="fas fa-bed text-primary me-1"></i>
            {globalStats.totalRooms} chambres
          </span>
          <span className="me-3">
            <i className="fas fa-users text-success me-1"></i>
            {globalStats.totalAssigned}/{globalStats.totalCapacity}
          </span>
          <span>
            <i className="fas fa-chart-pie text-info me-1"></i>
            {globalStats.totalCapacity > 0 ? Math.round((globalStats.totalAssigned / globalStats.totalCapacity) * 100) : 0}%
          </span>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {/* Filtres */}
        <div className="p-3 border-bottom bg-light">
          <InputGroup size="sm" className="mb-2">
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Rechercher un hôtel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Form.Select
            size="sm"
            value={filterOccupancy}
            onChange={(e) => setFilterOccupancy(e.target.value)}
          >
            <option value="all">Tous les taux d'occupation</option>
            <option value="empty">Vides (0%)</option>
            <option value="partial">Partiellement occupés</option>
            <option value="full">Complets (100%)</option>
            <option value="overbook">Surréservés (&gt;100%)</option>
          </Form.Select>
        </div>

        {/* Liste des hôtels */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredHotels.map((hotel) => (
            <Card key={hotel._id} className="m-2">
              <Card.Header className="py-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-1">
                      <i className="fas fa-hotel me-2"></i>
                      {hotel.name}
                    </h6>
                    <div className="small text-muted">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {hotel.address}
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <Badge bg={getOccupancyVariant(hotel.occupancyRate)}>
                      {hotel.assignedClients}/{hotel.totalCapacity}
                    </Badge>
                    <div className="small text-muted mt-1">
                      {Math.round(hotel.occupancyRate)}%
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <ProgressBar 
                  now={Math.min(hotel.occupancyRate, 100)}
                  variant={getOccupancyBg(hotel.occupancyRate)}
                  className="mt-2"
                  style={{ height: '4px' }}
                />
                {hotel.occupancyRate > 100 && (
                  <div className="small text-danger mt-1">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    Surréservation de {Math.round(hotel.occupancyRate - 100)}%
                  </div>
                )}
              </Card.Header>

              {/* Chambres de l'hôtel */}
              {hotel.rooms && hotel.rooms.length > 0 && (
                <Card.Body className="p-2">
                  <ListGroup variant="flush">
                    {hotel.rooms.map((room) => (
                      <ListGroup.Item
                        key={room.roomId}
                        className={`room-item ${isRoomSelected(room.roomId) ? 'selected' : ''}`}
                        onClick={(e) => handleRoomClick(room.roomId, e)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-bed me-2 text-primary"></i>
                              <div>
                                <div className="fw-medium">
                                  {room.roomNumber || `Chambre ${room.roomId.slice(-4)}`}
                                </div>
                                <div className="small text-muted">
                                  {room.roomType || 'Standard'}
                                  {room.assignedClients.length > 0 && (
                                    <span className="ms-2">
                                      {room.assignedClients.map(ac => 
                                        `${ac.clientId.firstName} ${ac.clientId.lastName}`
                                      ).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center">
                            <Badge 
                              bg={room.assignedClients.length > room.capacity ? 'danger' : 
                                  room.assignedClients.length === room.capacity ? 'success' : 
                                  room.assignedClients.length > 0 ? 'warning' : 'secondary'}
                              className="me-2"
                            >
                              {room.assignedClients.length}/{room.capacity}
                            </Badge>
                            
                            {isRoomSelected(room.roomId) && (
                              <i className="fas fa-check-circle text-primary"></i>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              )}
            </Card>
          ))}

          {filteredHotels.length === 0 && (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-search fa-2x mb-2"></i>
              <div>Aucun hôtel trouvé</div>
              {searchTerm && (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => setSearchTerm('')}
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </div>
      </Card.Body>

      <Card.Footer className="bg-light">
        <div className="d-flex justify-content-between align-items-center small">
          <span>{filteredHotels.length} hôtel(s) affiché(s)</span>
          {selectedRooms.length > 0 && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => selectRooms([])}
            >
              Désélectionner tout
            </Button>
          )}
        </div>
      </Card.Footer>

      <style jsx>{`
        .room-item {
          transition: all 0.2s ease;
        }
        
        .room-item:hover {
          background-color: #f8f9fa;
        }
        
        .room-item.selected {
          background-color: #e3f2fd;
          border-color: #2196f3;
        }
      `}</style>
    </Card>
  );
};

export default HotelsList;
