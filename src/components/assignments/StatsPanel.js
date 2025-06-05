import React, { useMemo } from 'react';
import { Card, Row, Col, ProgressBar, Badge, ListGroup } from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const StatsPanel = ({ clients, hotels, assignments }) => {
  const { realtimeStats } = useAssignmentContext();

  // Calculs statistiques détaillés
  const detailedStats = useMemo(() => {
    // Statistiques par type de client
    const clientTypeStats = clients.reduce((acc, client) => {
      acc[client.clientType] = acc[client.clientType] || { total: 0, assigned: 0 };
      acc[client.clientType].total++;
      return acc;
    }, {});

    // Compter les clients assignés par type
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => {
          const type = ac.clientId.clientType;
          if (clientTypeStats[type]) {
            clientTypeStats[type].assigned++;
          }
        });
      });
    });

    // Statistiques par genre
    const genderStats = clients.reduce((acc, client) => {
      acc[client.gender] = acc[client.gender] || { total: 0, assigned: 0 };
      acc[client.gender].total++;
      return acc;
    }, {});

    // Compter les clients assignés par genre
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => {
          const gender = ac.clientId.gender;
          if (genderStats[gender]) {
            genderStats[gender].assigned++;
          }
        });
      });
    });

    // Statistiques des hôtels
    const hotelStats = hotels.map(hotel => {
      const assignment = assignments.find(a => a.hotelId._id === hotel._id);
      const assignedCount = assignment ? 
        assignment.logicalRooms.reduce((total, room) => total + room.assignedClients.length, 0) : 0;
      
      return {
        name: hotel.name,
        capacity: hotel.totalCapacity || 0,
        assigned: assignedCount,
        occupancyRate: hotel.totalCapacity > 0 ? (assignedCount / hotel.totalCapacity) * 100 : 0,
        rooms: assignment ? assignment.logicalRooms.length : 0
      };
    });

    // Statistiques des groupes
    const groupStats = clients
      .filter(client => client.clientType === 'Groupe' && client.groupName)
      .reduce((acc, client) => {
        if (!acc[client.groupName]) {
          acc[client.groupName] = { 
            name: client.groupName, 
            total: 0, 
            assigned: 0, 
            members: [],
            genders: new Set()
          };
        }
        acc[client.groupName].total++;
        acc[client.groupName].members.push(client);
        acc[client.groupName].genders.add(client.gender);
        return acc;
      }, {});

    // Compter les membres de groupes assignés
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => {
          if (ac.clientId.groupName && groupStats[ac.clientId.groupName]) {
            groupStats[ac.clientId.groupName].assigned++;
          }
        });
      });
    });

    return {
      clientTypeStats,
      genderStats,
      hotelStats,
      groupStats: Object.values(groupStats)
    };
  }, [clients, hotels, assignments]);

  const getTypeIcon = (type) => {
    const icons = {
      'VIP': 'fas fa-star text-warning',
      'Influenceur': 'fas fa-users text-info',
      'Staff': 'fas fa-user-tie text-secondary',
      'Groupe': 'fas fa-users text-primary',
      'Solo': 'fas fa-user text-muted'
    };
    return icons[type] || 'fas fa-user text-muted';
  };

  const getProgressVariant = (percentage) => {
    if (percentage === 100) return 'success';
    if (percentage >= 80) return 'warning';
    if (percentage >= 50) return 'info';
    return 'secondary';
  };

  return (
    <div className="stats-panel">
      <Row className="g-3">
        {/* Statistiques générales */}
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Vue d'ensemble
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-primary">
                      {realtimeStats.totalClients || clients.length}
                    </div>
                    <div className="stat-label">Clients total</div>
                  </div>
                </Col>
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-success">
                      {realtimeStats.assignedClients || 0}
                    </div>
                    <div className="stat-label">Assignés</div>
                  </div>
                </Col>
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-warning">
                      {realtimeStats.unassignedClients || (clients.length - (realtimeStats.assignedClients || 0))}
                    </div>
                    <div className="stat-label">En attente</div>
                  </div>
                </Col>
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-info">
                      {Math.round(realtimeStats.globalOccupancyRate || 0)}%
                    </div>
                    <div className="stat-label">Occupation</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Statistiques par type de client */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Par type de client
              </h6>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {Object.entries(detailedStats.clientTypeStats).map(([type, stats]) => (
                  <ListGroup.Item key={type} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className={`${getTypeIcon(type)} me-2`}></i>
                      <span>{type}</span>
                    </div>
                    <div className="text-end">
                      <Badge bg={stats.assigned === stats.total ? 'success' : 'secondary'}>
                        {stats.assigned}/{stats.total}
                      </Badge>
                      <div className="small text-muted">
                        {stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0}%
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Statistiques par genre */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-venus-mars me-2"></i>
                Par genre
              </h6>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {Object.entries(detailedStats.genderStats).map(([gender, stats]) => (
                  <ListGroup.Item key={gender} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className={`fas fa-${gender === 'Homme' ? 'male text-primary' : 'female text-danger'} me-2`}></i>
                      <span>{gender}</span>
                    </div>
                    <div className="text-end">
                      <Badge bg={stats.assigned === stats.total ? 'success' : 'secondary'}>
                        {stats.assigned}/{stats.total}
                      </Badge>
                      <div className="small text-muted">
                        {stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0}%
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Statistiques des hôtels */}
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="fas fa-hotel me-2"></i>
                Occupation par hôtel
              </h6>
            </Card.Header>
            <Card.Body>
              {detailedStats.hotelStats.map((hotel, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-medium">{hotel.name}</span>
                    <span className="small text-muted">
                      {hotel.assigned}/{hotel.capacity} ({Math.round(hotel.occupancyRate)}%)
                    </span>
                  </div>
                  <ProgressBar 
                    now={Math.min(hotel.occupancyRate, 100)} 
                    variant={getProgressVariant(hotel.occupancyRate)}
                  />
                  {hotel.occupancyRate > 100 && (
                    <div className="small text-danger mt-1">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Surréservation
                    </div>
                  )}
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Statistiques des groupes */}
        {detailedStats.groupStats.length > 0 && (
          <Col md={12}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">
                  <i className="fas fa-layer-group me-2"></i>
                  Groupes
                </h6>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {detailedStats.groupStats.map((group, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-medium">{group.name}</div>
                          <div className="small text-muted">
                            {group.genders.size > 1 && (
                              <Badge bg="warning" className="me-2">Mixte</Badge>
                            )}
                            {group.total} membre(s)
                          </div>
                        </div>
                        <div className="text-end">
                          <Badge bg={group.assigned === group.total ? 'success' : 'warning'}>
                            {group.assigned}/{group.total}
                          </Badge>
                          <div className="small text-muted">
                            {group.assigned === group.total ? 'Complet' : 
                             group.assigned === 0 ? 'En attente' : 'Partiel'}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <style jsx>{`
        .stat-item {
          padding: 0.5rem;
        }
        
        .stat-number {
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }
        
        .stats-panel {
          max-height: 80vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default StatsPanel;
