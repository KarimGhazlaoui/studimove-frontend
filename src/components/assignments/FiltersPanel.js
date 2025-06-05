import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

const FiltersPanel = ({ clients, hotels, onFiltersChange }) => {
  const { filters, updateFilters, resetFilters } = useAssignmentContext();
  const [collapsed, setCollapsed] = useState(false);

  // Options de filtres disponibles
  const clientTypes = [...new Set(clients.map(c => c.clientType))].sort();
  const genders = [...new Set(clients.map(c => c.gender))].sort();
  const groups = [...new Set(clients.filter(c => c.groupName).map(c => c.groupName))].sort();
  const statuses = ['En attente', 'Assigné', 'Confirmé', 'Annulé'];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    updateFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleMultiSelectChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    handleFilterChange(filterType, newValues);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.clientTypes?.length > 0) count++;
    if (filters.genders?.length > 0) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.assignmentStatus && filters.assignmentStatus !== 'all') count++;
    if (filters.groupName) count++;
    if (filters.hotelId) count++;
    return count;
  };

  const clearAllFilters = () => {
    resetFilters();
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Filtres
            {getActiveFiltersCount() > 0 && (
              <Badge bg="primary" className="ms-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </h6>
          
          <div className="d-flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                size="sm"
                variant="outline-danger"
                onClick={clearAllFilters}
              >
                <i className="fas fa-times me-1"></i>
                Effacer
              </Button>
            )}
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setCollapsed(!collapsed)}
            >
              <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`}></i>
            </Button>
          </div>
        </div>
      </Card.Header>

      {!collapsed && (
        <Card.Body>
          <Row className="g-3">
            {/* Recherche textuelle */}
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold">
                  <i className="fas fa-search me-1"></i>
                  Recherche
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nom, prénom, téléphone..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Type de client */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">
                  <i className="fas fa-users me-1"></i>
                  Type de client
                </Form.Label>
                <div className="d-flex flex-wrap gap-1">
                  {clientTypes.map(type => (
                    <Form.Check
                      key={type}
                      type="checkbox"
                      id={`type-${type}`}
                      label={type}
                      checked={filters.clientTypes?.includes(type) || false}
                      onChange={(e) => handleMultiSelectChange('clientTypes', type, e.target.checked)}
                      className="me-2"
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>

            {/* Genre */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">
                  <i className="fas fa-venus-mars me-1"></i>
                  Genre
                </Form.Label>
                <div className="d-flex flex-wrap gap-1">
                  {genders.map(gender => (
                    <Form.Check
                      key={gender}
                      type="checkbox"
                      id={`gender-${gender}`}
                      label={gender}
                      checked={filters.genders?.includes(gender) || false}
                      onChange={(e) => handleMultiSelectChange('genders', gender, e.target.checked)}
                      className="me-2"
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>

            {/* Statut du client */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">
                  <i className="fas fa-flag me-1"></i>
                  Statut
                </Form.Label>
                <Form.Select
                  value={filters.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Statut d'assignation */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">
                  <i className="fas fa-bed me-1"></i>
                  Assignation
                </Form.Label>
                <Form.Select
                  value={filters.assignmentStatus || 'all'}
                  onChange={(e) => handleFilterChange('assignmentStatus', e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="assigned">Assignés</option>
                  <option value="unassigned">Non assignés</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Groupe spécifique */}
            {groups.length > 0 && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">
                    <i className="fas fa-layer-group me-1"></i>
                    Groupe
                  </Form.Label>
                  <Form.Select
                    value={filters.groupName || ''}
                    onChange={(e) => handleFilterChange('groupName', e.target.value)}
                  >
                    <option value="">Tous les groupes</option>
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {/* Hôtel spécifique */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">
                  <i className="fas fa-hotel me-1"></i>
                  Hôtel
                </Form.Label>
                <Form.Select
                  value={filters.hotelId || ''}
                  onChange={(e) => handleFilterChange('hotelId', e.target.value)}
                >
                  <option value="">Tous les hôtels</option>
                  {hotels.map(hotel => (
                    <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Filtres rapides */}
            <Col md={12}>
              <Form.Label className="small fw-bold">
                <i className="fas fa-bolt me-1"></i>
                Filtres rapides
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                <ButtonGroup size="sm">
                  <Button
                    variant={filters.quickFilter === 'vip' ? 'warning' : 'outline-warning'}
                    onClick={() => handleFilterChange('quickFilter', 
                      filters.quickFilter === 'vip' ? null : 'vip')}
                  >
                    <i className="fas fa-star me-1"></i>
                    VIP uniquement
                  </Button>
                  <Button
                    variant={filters.quickFilter === 'unassigned' ? 'danger' : 'outline-danger'}
                    onClick={() => handleFilterChange('quickFilter', 
                      filters.quickFilter === 'unassigned' ? null : 'unassigned')}
                  >
                    <i className="fas fa-user-clock me-1"></i>
                    Non assignés
                  </Button>
                  <Button
                    variant={filters.quickFilter === 'groups' ? 'info' : 'outline-info'}
                    onClick={() => handleFilterChange('quickFilter', 
                      filters.quickFilter === 'groups' ? null : 'groups')}
                  >
                    <i className="fas fa-users me-1"></i>
                    Groupes uniquement
                  </Button>
                </ButtonGroup>
              </div>
            </Col>

            {/* Options avancées */}
            <Col md={12}>
              <Form.Label className="small fw-bold">
                <i className="fas fa-cog me-1"></i>
                Options avancées
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                <Form.Check
                  type="checkbox"
                  id="show-mixed-groups"
                  label="Groupes mixtes uniquement"
                  checked={filters.showMixedGroups || false}
                  onChange={(e) => handleFilterChange('showMixedGroups', e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  id="show-separated-groups"
                  label="Groupes séparés"
                  checked={filters.showSeparatedGroups || false}
                  onChange={(e) => handleFilterChange('showSeparatedGroups', e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  id="show-overcapacity"
                  label="Hôtels en surréservation"
                  checked={filters.showOvercapacity || false}
                  onChange={(e) => handleFilterChange('showOvercapacity', e.target.checked)}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      )}

      <Card.Footer className="bg-light">
        <div className="d-flex justify-content-between align-items-center small">
          <span>
            {getActiveFiltersCount() > 0 ? (
              <span className="text-primary">
                <i className="fas fa-filter me-1"></i>
                {getActiveFiltersCount()} filtre(s) actif(s)
              </span>
            ) : (
              <span className="text-muted">Aucun filtre actif</span>
            )}
          </span>
          
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Afficher les filtres' : 'Masquer les filtres'}
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default FiltersPanel;