import React, { useState, useMemo } from 'react';
import { Card, ListGroup, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const ClientsList = ({ clients }) => {
  const {
    selectedClients,
    selectClients,
    isClientSelected,
    assignClient,
    unassignClient,
    assignments
  } = useAssignmentContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Clients filtrés
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = !searchTerm || 
        `${client.firstName} ${client.lastName} ${client.groupName || ''}${client.phone}`
          .toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || client.clientType === filterType;
      
      const isAssigned = assignments.some(assignment =>
        assignment.logicalRooms.some(room =>
          room.assignedClients.some(ac => ac.clientId._id === client._id)
        )
      );
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'assigned' && isAssigned) ||
        (filterStatus === 'unassigned' && !isAssigned);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [clients, searchTerm, filterType, filterStatus, assignments]);

  // Statistiques
  const stats = useMemo(() => {
    const assignedIds = new Set();
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => assignedIds.add(ac.clientId._id));
      });
    });

    return {
      total: clients.length,
      assigned: assignedIds.size,
      unassigned: clients.length - assignedIds.size,
      byType: clients.reduce((acc, client) => {
        acc[client.clientType] = (acc[client.clientType] || 0) + 1;
        return acc;
      }, {})
    };
  }, [clients, assignments]);

  const handleClientClick = (clientId, event) => {
    if (event.ctrlKey || event.metaKey) {
      const newSelection = isClientSelected(clientId)
        ? selectedClients.filter(id => id !== clientId)
        : [...selectedClients, clientId];
      selectClients(newSelection);
    } else {
      selectClients([clientId]);
    }
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

  const getClientStatus = (client) => {
    const isAssigned = assignments.some(assignment =>
      assignment.logicalRooms.some(room =>
        room.assignedClients.some(ac => ac.clientId._id === client._id)
      )
    );
    return isAssigned ? 'assigned' : 'unassigned';
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Clients
            <Badge bg="secondary" className="ms-2">
              {filteredClients.length}
            </Badge>
          </h5>
          
          {selectedClients.length > 0 && (
            <Badge bg="primary">
              {selectedClients.length} sélectionné(s)
            </Badge>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="small text-muted mt-2">
          <span className="me-3">
            <i className="fas fa-check-circle text-success me-1"></i>
            {stats.assigned} assignés
          </span>
          <span>
            <i className="fas fa-clock text-warning me-1"></i>
            {stats.unassigned} en attente
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
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <div className="row g-2">
            <div className="col-6">
              <Form.Select
                size="sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="VIP">VIP</option>
                <option value="Influenceur">Influenceurs</option>
                <option value="Staff">Staff</option>
                <option value="Groupe">Groupes</option>
                <option value="Solo">Solo</option>
              </Form.Select>
            </div>
            <div className="col-6">
              <Form.Select
                size="sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="assigned">Assignés</option>
                <option value="unassigned">Non assignés</option>
              </Form.Select>
            </div>
          </div>
        </div>

        {/* Liste des clients */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <ListGroup variant="flush">
            {filteredClients.map((client) => (
              <ListGroup.Item
                key={client._id}
                className={`client-item ${isClientSelected(client._id) ? 'selected' : ''}`}
                onClick={(e) => handleClientClick(client._id, e)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <i className={`${getClientTypeIcon(client.clientType)} me-2`}></i>
                      <div>
                        <div className="fw-medium">
                          {client.firstName} {client.lastName}
                        </div>
                        <div className="small text-muted">
                          {client.clientType}
                          {client.groupName && ` • ${client.groupName}`}
                          <span className="ms-1">
                            <i className={`fas fa-${client.gender === 'Homme' ? 'male' : 'female'}`}></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <Badge 
                      bg={getClientStatus(client) === 'assigned' ? 'success' : 'warning'}
                      className="me-2"
                    >
                      {getClientStatus(client) === 'assigned' ? 'Assigné' : 'En attente'}
                    </Badge>
                    
                    {isClientSelected(client._id) && (
                      <i className="fas fa-check-circle text-primary"></i>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {filteredClients.length === 0 && (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-search fa-2x mb-2"></i>
              <div>Aucun client trouvé</div>
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
          <span>{filteredClients.length} client(s) affiché(s)</span>
          {selectedClients.length > 0 && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => selectClients([])}
            >
              Désélectionner tout
            </Button>
          )}
        </div>
      </Card.Footer>

      <style jsx>{`
        .client-item {
          transition: all 0.2s ease;
        }
        
        .client-item:hover {
          background-color: #f8f9fa;
        }
        
        .client-item.selected {
          background-color: #e3f2fd;
          border-color: #2196f3;
        }
      `}</style>
    </Card>
  );
};

export default ClientsList;