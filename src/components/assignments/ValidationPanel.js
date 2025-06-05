import React, { useMemo, useState } from 'react';
import { Card, Alert, ListGroup, Badge, Button, Collapse } from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const ValidationPanel = ({ clients, hotels, assignments }) => {
  const { validateAssignments } = useAssignmentContext();
  const [showDetails, setShowDetails] = useState({});

  // Validation complète des assignations
  const validationResults = useMemo(() => {
    const errors = [];
    const warnings = [];
    const infos = [];

    // 1. Vérification des capacités d'hôtels
    assignments.forEach(assignment => {
      const hotel = hotels.find(h => h._id === assignment.hotelId._id);
      if (!hotel) return;

      const totalAssigned = assignment.logicalRooms.reduce((total, room) => 
        total + room.assignedClients.length, 0
      );

      if (totalAssigned > hotel.totalCapacity) {
        errors.push({
          id: `capacity_${hotel._id}`,
          type: 'capacity_exceeded',
          severity: 'error',
          title: `Capacité dépassée - ${hotel.name}`,
          message: `${totalAssigned} clients assignés pour ${hotel.totalCapacity} places`,
          hotel: hotel.name,
          details: {
            assigned: totalAssigned,
            capacity: hotel.totalCapacity,
            overflow: totalAssigned - hotel.totalCapacity
          }
        });
      }
    });

    // 2. Vérification des groupes mixtes
    const mixedGroupIssues = {};
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        const genders = new Set();
        const groups = {};
        
        room.assignedClients.forEach(ac => {
          genders.add(ac.clientId.gender);
          if (ac.clientId.groupName) {
            if (!groups[ac.clientId.groupName]) {
              groups[ac.clientId.groupName] = [];
            }
            groups[ac.clientId.groupName].push(ac.clientId);
          }
        });

        // Vérifier les groupes mixtes dans la même chambre
        Object.entries(groups).forEach(([groupName, members]) => {
          const groupGenders = new Set(members.map(m => m.gender));
          if (groupGenders.size > 1) {
            const key = `mixed_${groupName}_${room.roomId}`;
            if (!mixedGroupIssues[key]) {
              warnings.push({
                id: key,
                type: 'mixed_group',
                severity: 'warning',
                title: `Groupe mixte - ${groupName}`,
                message: `Hommes et femmes dans la même chambre`,
                hotel: assignment.hotelId.name,
                room: room.roomNumber || room.roomId,
                details: {
                  groupName,
                  members: members.map(m => `${m.firstName} ${m.lastName} (${m.gender})`),
                  recommendation: 'Considérer une chambre VIP ou séparer le groupe'
                }
              });
              mixedGroupIssues[key] = true;
            }
          }
        });
      });
    });

    // 3. Vérification des groupes séparés
    const groupSeparationIssues = {};
    clients.filter(c => c.groupName).forEach(client => {
      if (groupSeparationIssues[client.groupName]) return;

      const groupMembers = clients.filter(c => c.groupName === client.groupName);
      const assignedMembers = [];
      const roomsUsed = new Set();

      assignments.forEach(assignment => {
        assignment.logicalRooms.forEach(room => {
          room.assignedClients.forEach(ac => {
            if (ac.clientId.groupName === client.groupName) {
              assignedMembers.push({
                member: ac.clientId,
                hotel: assignment.hotelId.name,
                room: room.roomNumber || room.roomId
              });
              roomsUsed.add(`${assignment.hotelId.name}_${room.roomId}`);
            }
          });
        });
      });

      if (assignedMembers.length > 0 && roomsUsed.size > 1) {
        warnings.push({
          id: `separated_${client.groupName}`,
          type: 'group_separated',
          severity: 'warning',
          title: `Groupe séparé - ${client.groupName}`,
          message: `Membres répartis dans ${roomsUsed.size} chambres/hôtels différents`,
          details: {
            groupName: client.groupName,
            totalMembers: groupMembers.length,
            assignedMembers: assignedMembers.length,
            assignments: assignedMembers
          }
        });
        groupSeparationIssues[client.groupName] = true;
      }
    });

    // 4. Clients non assignés
    const assignedClientIds = new Set();
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => {
          assignedClientIds.add(ac.clientId._id);
        });
      });
    });

    const unassignedClients = clients.filter(c => !assignedClientIds.has(c._id));
    if (unassignedClients.length > 0) {
      const vipUnassigned = unassignedClients.filter(c => c.clientType === 'VIP');
      const influencerUnassigned = unassignedClients.filter(c => c.clientType === 'Influenceur');
      
      if (vipUnassigned.length > 0) {
        errors.push({
          id: 'unassigned_vip',
          type: 'unassigned_priority',
          severity: 'error',
          title: 'Clients VIP non assignés',
          message: `${vipUnassigned.length} client(s) VIP en attente d'assignation`,
          details: {
            clients: vipUnassigned.map(c => `${c.firstName} ${c.lastName}`)
          }
        });
      }

      if (influencerUnassigned.length > 0) {
        warnings.push({
          id: 'unassigned_influencer',
          type: 'unassigned_priority',
          severity: 'warning',
          title: 'Influenceurs non assignés',
          message: `${influencerUnassigned.length} influenceur(s) en attente d'assignation`,
          details: {
            clients: influencerUnassigned.map(c => `${c.firstName} ${c.lastName}`)
          }
        });
      }

      if (unassignedClients.length > vipUnassigned.length + influencerUnassigned.length) {
        infos.push({
          id: 'unassigned_general',
          type: 'unassigned',
          severity: 'info',
          title: 'Clients non assignés',
          message: `${unassignedClients.length} client(s) au total en attente`,
          details: {
            total: unassignedClients.length,
            byType: unassignedClients.reduce((acc, c) => {
              acc[c.clientType] = (acc[c.clientType] || 0) + 1;
              return acc;
            }, {})
          }
        });
      }
    }

    // 5. Vérification des préférences non respectées
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => {
          const client = ac.clientId;
          if (client.preferences) {
            // Vérifier les préférences d'hôtel
            if (client.preferences.hotelPreference && 
                client.preferences.hotelPreference !== assignment.hotelId._id) {
              infos.push({
                id: `pref_hotel_${client._id}`,
                type: 'preference_ignored',
                severity: 'info',
                title: `Préférence d'hôtel non respectée`,
                message: `${client.firstName} ${client.lastName} préférait un autre hôtel`,
                details: {
                  client: `${client.firstName} ${client.lastName}`,
                  preferredHotel: client.preferences.hotelPreference,
                  assignedHotel: assignment.hotelId.name
                }
              });
            }
          }
        });
      });
    });

    return {
      errors,
      warnings,
      infos,
      isValid: errors.length === 0,
      hasWarnings: warnings.length > 0,
      totalIssues: errors.length + warnings.length + infos.length
    };
  }, [clients, hotels, assignments]);

  const toggleDetails = (issueId) => {
    setShowDetails(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }));
  };

  const getIssueIcon = (severity) => {
    const icons = {
      'error': 'fas fa-exclamation-circle text-danger',
      'warning': 'fas fa-exclamation-triangle text-warning',
      'info': 'fas fa-info-circle text-info'
    };
    return icons[severity] || 'fas fa-circle text-muted';
  };

  const getIssueVariant = (severity) => {
    const variants = {
      'error': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    return variants[severity] || 'secondary';
  };

  const allIssues = [
    ...validationResults.errors,
    ...validationResults.warnings,
    ...validationResults.infos
  ];

  if (allIssues.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
          <h6 className="text-success">Validation réussie</h6>
          <p className="text-muted mb-0">Aucun problème détecté dans les assignations</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">
            <i className="fas fa-shield-alt me-2"></i>
            Validation des assignations
          </h6>
          
          <div className="d-flex gap-2">
            {validationResults.errors.length > 0 && (
              <Badge bg="danger">{validationResults.errors.length} erreur(s)</Badge>
            )}
            {validationResults.warnings.length > 0 && (
              <Badge bg="warning">{validationResults.warnings.length} avertissement(s)</Badge>
            )}
            {validationResults.infos.length > 0 && (
              <Badge bg="info">{validationResults.infos.length} info(s)</Badge>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {/* Résumé global */}
        {!validationResults.isValid && (
          <Alert variant="danger" className="m-3 mb-2">
            <Alert.Heading className="h6">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Problèmes détectés
            </Alert.Heading>
            <p className="mb-0">
              {validationResults.errors.length > 0 && 
                `${validationResults.errors.length} erreur(s) critique(s) à corriger. `}
              {validationResults.warnings.length > 0 && 
                `${validationResults.warnings.length} avertissement(s) à examiner.`}
            </p>
          </Alert>
        )}

        {/* Liste des problèmes */}
        <ListGroup variant="flush">
          {allIssues.map((issue) => (
            <ListGroup.Item key={issue.id}>
              <div className="d-flex align-items-start">
                <div className="me-3 mt-1">
                  <i className={getIssueIcon(issue.severity)}></i>
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="mb-1">{issue.title}</h6>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => toggleDetails(issue.id)}
                    >
                      <i className={`fas fa-chevron-${showDetails[issue.id] ? 'up' : 'down'}`}></i>
                    </Button>
                  </div>
                  
                  <p className="mb-1">{issue.message}</p>
                  
                  {issue.hotel && (
                    <div className="small text-muted">
                      <i className="fas fa-hotel me-1"></i>
                      {issue.hotel}
                      {issue.room && ` • Chambre ${issue.room}`}
                    </div>
                  )}

                  <Collapse in={showDetails[issue.id]}>
                    <div className="mt-2">
                      {issue.details && (
                        <div className="bg-light p-3 rounded">
                          {typeof issue.details === 'string' ? (
                            <span>{issue.details}</span>
                          ) : (
                            <div>
                              {Object.entries(issue.details).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                  <strong>{key}:</strong>
                                  {Array.isArray(value) ? (
                                    <ul className="mb-0 ms-3">
                                      {value.map((item, index) => (
                                        <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="ms-2">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Collapse>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>

      <Card.Footer className="bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <div className="small">
            {validationResults.isValid ? (
              <span className="text-success">
                <i className="fas fa-check me-1"></i>
                Toutes les validations sont réussies
              </span>
            ) : (
              <span>
                {validationResults.totalIssues} problème(s) détecté(s)
                {validationResults.errors.length > 0 && 
                  <span className="text-danger"> • {validationResults.errors.length} critique(s)</span>}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => validateAssignments()}
          >
            <i className="fas fa-sync me-1"></i>
            Re-valider
          </Button>
        </div>
      </Card.Footer>

      <style jsx>{`
        .validation-issue {
          transition: all 0.2s ease;
        }
        
        .validation-issue:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </Card>
  );
};

export default ValidationPanel;
