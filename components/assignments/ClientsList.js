import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  Row, 
  Col, 
  InputGroup, 
  Alert,
  OverlayTrigger,
  Tooltip,
  Dropdown
} from 'react-bootstrap';
import { 
  FaUser, 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaHotel,
  FaUserPlus,
  FaMale,
  FaFemale,
  FaCrown,
  FaStar,
  FaUserTie,
  FaUserFriends,
  FaPhone,
  FaEnvelope,
  FaBed,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

const ClientsList = ({ 
  clients = [], 
  onSelectClient, 
  onEditClient, 
  onDeleteClient,
  onManualAssign,
  onViewClient,
  selectedClients = [],
  onSelectMultiple,
  eventId,
  loading = false 
}) => {
  // 🎯 ÉTATS LOCAUX
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // table | cards

  // 📊 CALCUL DES TAILLES DE GROUPE EN TEMPS RÉEL
  const groupSizes = useMemo(() => {
    const sizes = {};
    clients.forEach(client => {
      if (client.groupName) {
        sizes[client.groupName] = (sizes[client.groupName] || 0) + 1;
      }
    });
    return sizes;
  }, [clients]);

  // 👥 GROUPES UNIQUES AVEC INFOS
  const groupsInfo = useMemo(() => {
    const groups = {};
    clients.forEach(client => {
      if (client.groupName) {
        if (!groups[client.groupName]) {
          groups[client.groupName] = {
            name: client.groupName,
            members: [],
            genders: new Set(),
            types: new Set(),
            assigned: 0,
            mixed: false,
            priority: false
          };
        }
        
        const group = groups[client.groupName];
        group.members.push(client);
        group.genders.add(client.gender);
        group.types.add(client.clientType);
        
        if (client.assignedHotel) group.assigned++;
        if (group.genders.size > 1) group.mixed = true;
        if (['VIP', 'Influenceur', 'Staff'].includes(client.clientType)) {
          group.priority = true;
        }
      }
    });
    
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  // 🔍 FILTRAGE INTELLIGENT DES CLIENTS
  const filteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      // Recherche textuelle étendue
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.groupName && client.groupName.toLowerCase().includes(searchLower)) ||
        (client.notes && client.notes.toLowerCase().includes(searchLower));

      // Filtres spécifiques
      const matchesGender = filterGender === 'all' || client.gender === filterGender;
      const matchesType = filterType === 'all' || client.clientType === filterType;
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      
      // Filtre par groupe
      const matchesGroup = filterGroup === 'all' || 
        (filterGroup === 'solo' && !client.groupName) ||
        (filterGroup === 'groups' && client.groupName) ||
        client.groupName === filterGroup;

      // Filtre par assignation
      const matchesAssignment = filterAssignment === 'all' ||
        (filterAssignment === 'assigned' && client.assignedHotel) ||
        (filterAssignment === 'unassigned' && !client.assignedHotel);

      return matchesSearch && matchesGender && matchesType && 
             matchesStatus && matchesGroup && matchesAssignment;
    });

    // 📈 TRI INTELLIGENT
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'phone':
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 'type':
          // Ordre de priorité : VIP > Influenceur > Staff > Standard
          const typeOrder = { 'VIP': 1, 'Influenceur': 2, 'Staff': 3, 'Standard': 4 };
          aValue = typeOrder[a.clientType] || 5;
          bValue = typeOrder[b.clientType] || 5;
          break;
        case 'group':
          aValue = a.groupName || 'zzz_solo'; // Solo à la fin
          bValue = b.groupName || 'zzz_solo';
          break;
        case 'status':
          const statusOrder = { 'Arrivé': 1, 'Assigné': 2, 'Confirmé': 3, 'En attente': 4 };
          aValue = statusOrder[a.status] || 5;
          bValue = statusOrder[b.status] || 5;
          break;
        case 'gender':
          aValue = a.gender;
          bValue = b.gender;
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [clients, searchTerm, filterGender, filterType, filterStatus, filterGroup, filterAssignment, sortBy, sortOrder]);

  // 📊 STATISTIQUES AVANCÉES
  const stats = useMemo(() => {
    const total = clients.length;
    const filtered = filteredClients.length;
    
    const byGender = clients.reduce((acc, c) => {
      acc[c.gender] = (acc[c.gender] || 0) + 1;
      return acc;
    }, {});

    const byType = clients.reduce((acc, c) => {
      acc[c.clientType] = (acc[c.clientType] || 0) + 1;
      return acc;
    }, {});

    const byStatus = clients.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const assigned = clients.filter(c => c.assignedHotel).length;
    const priority = clients.filter(c => ['VIP', 'Influenceur', 'Staff'].includes(c.clientType)).length;
    const mixed = groupsInfo.filter(g => g.mixed).length;

    return {
      total,
      filtered,
      byGender,
      byType,
      byStatus,
      assigned,
      unassigned: total - assigned,
      priority,
      groups: groupsInfo.length,
      solos: clients.filter(c => !c.groupName).length,
      mixedGroups: mixed
    };
  }, [clients, filteredClients, groupsInfo]);

  // 🎨 FONCTIONS UTILITAIRES POUR L'AFFICHAGE
  const getClientTypeBadge = (type) => {
    const config = {
      'VIP': { bg: 'danger', icon: <FaCrown /> },
      'Influenceur': { bg: 'warning', icon: <FaStar /> },
      'Staff': { bg: 'info', icon: <FaUserTie /> },
      'Standard': { bg: 'secondary', icon: <FaUser /> }
    };
    return config[type] || config['Standard'];
  };

  const getStatusBadge = (status) => {
    const config = {
      'En attente': { bg: 'secondary', icon: '⏳' },
      'Confirmé': { bg: 'primary', icon: '✓' },
      'Assigné': { bg: 'success', icon: '🏨' },
      'Arrivé': { bg: 'info', icon: '✈️' },
      'Parti': { bg: 'dark', icon: '👋' }
    };
    return config[status] || config['En attente'];
  };

  const getGenderBadge = (gender) => {
    const config = {
      'Homme': { bg: 'primary', icon: <FaMale /> },
      'Femme': { bg: 'danger', icon: <FaFemale /> },
      'Autre': { bg: 'secondary', icon: <FaUser /> }
    };
    return config[gender] || config['Autre'];
  };

  // 🔄 GESTION DU TRI
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSort className="text-muted" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-primary" /> : <FaSortDown className="text-primary" />;
  };

  // 🎯 SÉLECTION MULTIPLE
  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      // Tout désélectionner
      filteredClients.forEach(client => {
        if (selectedClients.includes(client._id)) {
          onSelectMultiple(client._id);
        }
      });
    } else {
      // Tout sélectionner
      filteredClients.forEach(client => {
        if (!selectedClients.includes(client._id)) {
          onSelectMultiple(client._id);
        }
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des clients...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {/* 📊 STATISTIQUES RAPIDES */}
      <Row className="mb-4">
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="text-center border-primary h-100">
            <Card.Body className="py-3">
              <h4 className="text-primary mb-1">{stats.total}</h4>
              <small className="text-muted">Total clients</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="text-center border-success h-100">
            <Card.Body className="py-3">
              <h4 className="text-success mb-1">{stats.assigned}</h4>
              <small className="text-muted">Assignés</small>
              <div className="mt-1">
                <small className="text-success">
                  {stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0}%
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="text-center border-warning h-100">
            <Card.Body className="py-3">
              <h4 className="text-warning mb-1">{stats.unassigned}</h4>
              <small className="text-muted">Non assignés</small>
              {stats.priority > 0 && (
                <div className="mt-1">
                  <Badge bg="danger" className="fs-6">
                    {stats.priority} prioritaires
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="text-center border-info h-100">
            <Card.Body className="py-3">
              <h4 className="text-info mb-1">{stats.groups}</h4>
              <small className="text-muted">Groupes</small>
              {stats.mixedGroups > 0 && (
                <div className="mt-1">
                  <Badge bg="warning" className="fs-6">
                    {stats.mixedGroups} mixtes
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="text-center border-secondary h-100">
            <Card.Body className="py-3">
              <h4 className="text-secondary mb-1">{stats.solos}</h4>
              <small className="text-muted">Clients solo</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={2} md={4} sm={6} className="mb-3">
          <Card className="text-center border-dark h-100">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-center align-items-center">
                <div className="me-2 text-primary">
                  <FaMale />
                  <span className="ms-1">{stats.byGender['Homme'] || 0}</span>
                </div>
                <div className="text-danger">
                  <FaFemale />
                  <span className="ms-1">{stats.byGender['Femme'] || 0}</span>
                </div>
              </div>
              <small className="text-muted">Répartition H/F</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
      <Card className="mb-4">
        <Card.Header>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-0">
                <FaUsers className="me-2" />
                Liste des Clients 
                <Badge bg="secondary" className="ms-2">
                  {filteredClients.length}
                  {filteredClients.length !== stats.total && ` / ${stats.total}`}
                </Badge>
              </h5>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex gap-2 justify-content-end align-items-center">
                {onSelectMultiple && (
                  <Form.Check
                    type="checkbox"
                    id="select-all"
                    label={`Tout sélectionner (${selectedClients.length})`}
                    checked={selectedClients.length > 0 && selectedClients.length === filteredClients.length}
                    onChange={handleSelectAll}
                    className="me-3"
                  />
                )}
                
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('table')}>
                  Tableau
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('cards')}>
                  Cartes
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-3">
            {/* RECHERCHE */}
            <Col md={4} className="mb-2">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher (nom, téléphone, email, groupe...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* FILTRE SEXE */}
            <Col md={2} className="mb-2">
              <Form.Select 
                value={filterGender} 
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="all">Tous les sexes</option>
                <option value="Homme">Hommes</option>
                <option value="Femme">Femmes</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </Col>

            {/* FILTRE TYPE */}
            <Col md={2} className="mb-2">
              <Form.Select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="VIP">VIP</option>
                <option value="Influenceur">Influenceurs</option>
                <option value="Staff">Staff</option>
                <option value="Standard">Standard</option>
              </Form.Select>
            </Col>

            {/* FILTRE STATUT */}
            <Col md={2} className="mb-2">
              <Form.Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Confirmé">Confirmés</option>
                <option value="Assigné">Assignés</option>
                <option value="Arrivé">Arrivés</option>
                <option value="Parti">Partis</option>
              </Form.Select>
            </Col>

            {/* FILTRE GROUPE */}
            <Col md={2} className="mb-2">
              <Form.Select 
                value={filterGroup} 
                onChange={(e) => setFilterGroup(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="solo">Clients solo</option>
                <option value="groups">En groupe</option>
                {groupsInfo.map(group => (
                  <option key={group.name} value={group.name}>
                    {group.name} ({group.members.length})
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* FILTRE ASSIGNATION */}
          <Row>
            <Col md={3}>
              <Form.Select 
                value={filterAssignment} 
                onChange={(e) => setFilterAssignment(e.target.value)}
              >
                <option value="all">Assignation - Tous</option>
                <option value="assigned">Assignés</option>
                <option value="unassigned">Non assignés</option>
              </Form.Select>
            </Col>
            
            {/* RESET FILTRES */}
            <Col md={9} className="text-end">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterGender('all');
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterGroup('all');
                  setFilterAssignment('all');
                }}
              >
                <FaFilter className="me-1" />
                Réinitialiser les filtres
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 📋 TABLEAU DES CLIENTS */}
      {viewMode === 'table' ? (
        <Card>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  {onSelectMultiple && (
                    <th style={{ width: '50px' }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedClients.length > 0 && selectedClients.length === filteredClients.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  
                  <th 
                    style={{ cursor: 'pointer', minWidth: '200px' }}
                    onClick={() => handleSort('name')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      Client
                      {getSortIcon('name')}
                    </div>
                  </th>
                  
                  <th 
                    style={{ cursor: 'pointer', width: '100px' }}
                    onClick={() => handleSort('gender')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      Sexe
                      {getSortIcon('gender')}
                    </div>
                  </th>
                  
                  <th 
                    style={{ cursor: 'pointer', minWidth: '150px' }}
                    onClick={() => handleSort('phone')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      Contact
                      {getSortIcon('phone')}
                    </div>
                  </th>
                  
                  <th 
                    style={{ cursor: 'pointer', width: '120px' }}
                    onClick={() => handleSort('type')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      Type
                      {getSortIcon('type')}
                    </div>
                  </th>
                  
                  <th 
                    style={{ cursor: 'pointer', minWidth: '150px' }}
                    onClick={() => handleSort('group')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      Groupe
                      {getSortIcon('group')}
                    </div>
                  </th>
                  
                  <th style={{ width: '80px' }}>Taille</th>
                  
                  <th 
                    style={{ cursor: 'pointer', width: '100px' }}
                    onClick={() => handleSort('status')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      Statut
                      {getSortIcon('status')}
                    </div>
                  </th>
                  
                  <th style={{ minWidth: '180px' }}>Hôtel assigné</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={onSelectMultiple ? 10 : 9} className="text-center py-4">
                      <div className="text-muted">
                        <FaUsers size={48} className="mb-3 opacity-50" />
                        <p className="mb-0">
                          {searchTerm || filterGender !== 'all' || filterType !== 'all' || 
                           filterStatus !== 'all' || filterGroup !== 'all' || filterAssignment !== 'all'
                            ? 'Aucun client ne correspond aux critères de recherche'
                            : 'Aucun client dans cet événement'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(client => {
                    const groupSize = client.groupName ? (groupSizes[client.groupName] || 1) : 1;
                    const isSelected = selectedClients.includes(client._id);
                    const typeConfig = getClientTypeBadge(client.clientType);
                    const statusConfig = getStatusBadge(client.status);
                    const genderConfig = getGenderBadge(client.gender);

                    return (
                      <tr 
                        key={client._id}
                        className={`${isSelected ? 'table-active' : ''} ${client.clientType === 'VIP' ? 'table-warning' : ''}`}
                        style={{ cursor: onSelectClient ? 'pointer' : 'default' }}
                        onClick={() => onSelectClient && onSelectClient(client)}
                      >
                        {onSelectMultiple && (
                          <td onClick={(e) => e.stopPropagation()}>
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onSelectMultiple(client._id)}
                            />
                          </td>
                        )}

                        {/* CLIENT INFO */}
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <div className="fw-bold">
                                {client.firstName} {client.lastName}
                                {client.clientType === 'VIP' && (
                                  <FaCrown className="ms-2 text-warning" />
                                )}
                              </div>
                              <small className="text-muted">
                                {client.source === 'CSV' && (
                                  <Badge bg="outline-info" className="me-1 fs-6">CSV</Badge>
                                )}
                                ID: {client._id.slice(-6)}
                              </small>
                              {client.notes && (
                                <div className="mt-1">
                                  <small className="text-info">
                                    📝 {client.notes.substring(0, 50)}
                                    {client.notes.length > 50 && '...'}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SEXE */}
                        <td>
                          <Badge bg={genderConfig.bg} className="d-flex align-items-center">
                            {genderConfig.icon}
                            <span className="ms-1">{client.gender}</span>
                          </Badge>
                        </td>

                        {/* CONTACT */}
                        <td>
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <FaPhone className="me-1 text-muted" size={12} />
                              <span className="font-monospace small">{client.phone}</span>
                            </div>
                            {client.email && (
                              <div className="d-flex align-items-center">
                                <FaEnvelope className="me-1 text-muted" size={12} />
                                <small className="text-muted text-truncate" style={{ maxWidth: '120px' }}>
                                  {client.email}
                                </small>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* TYPE CLIENT */}
                        <td>
                          <Badge bg={typeConfig.bg} className="d-flex align-items-center">
                            {typeConfig.icon}
                            <span className="ms-1">{client.clientType}</span>
                          </Badge>
                        </td>

                        {/* GROUPE */}
                        <td>
                          {client.groupName ? (
                            <div>
                              <div className="d-flex align-items-center">
                                <FaUsers className="me-1 text-primary" size={14} />
                                <span className="fw-bold text-primary">{client.groupName}</span>
                              </div>
                              {client.groupRelation && (
                                <small className="text-muted">{client.groupRelation}</small>
                              )}
                              {/* Indicateur groupe mixte */}
                              {groupsInfo.find(g => g.name === client.groupName)?.mixed && (
                                <Badge bg="warning" className="ms-1 fs-6">
                                  <FaExclamationTriangle size={10} className="me-1" />
                                  Mixte
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Badge bg="secondary" className="d-flex align-items-center">
                              <FaUser className="me-1" />
                              Solo
                            </Badge>
                          )}
                        </td>

                        {/* TAILLE GROUPE */}
                        <td className="text-center">
                          <Badge 
                            bg={groupSize > 1 ? 'info' : 'secondary'} 
                            className="fs-6"
                          >
                            {groupSize}
                          </Badge>
                        </td>

                        {/* STATUT */}
                        <td>
                          <Badge bg={statusConfig.bg} className="d-flex align-items-center">
                            <span className="me-1">{statusConfig.icon}</span>
                            {client.status}
                          </Badge>
                        </td>

                        {/* HÔTEL ASSIGNÉ */}
                        <td>
                          {client.assignedHotel ? (
                            <div>
                              <div className="d-flex align-items-center">
                                <FaHotel className="me-1 text-success" size={14} />
                                <span className="fw-bold text-success">
                                  {client.assignedHotel.name}
                                </span>
                              </div>
                              {client.logicalRoomId && (
                                <div className="d-flex align-items-center mt-1">
                                  <FaBed className="me-1 text-muted" size={12} />
                                  <small className="text-muted">
                                    Chambre: {client.logicalRoomId}
                                    {client.realRoomNumber && ` (${client.realRoomNumber})`}
                                  </small>
                                </div>
                              )}
                              {client.assignmentDate && (
                                <div className="d-flex align-items-center mt-1">
                                  <FaCalendarAlt className="me-1 text-muted" size={10} />
                                  <small className="text-muted">
                                    {new Date(client.assignmentDate).toLocaleDateString('fr-FR')}
                                  </small>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <Badge bg="outline-warning" className="d-flex align-items-center">
                                <FaMapMarkerAlt className="me-1" />
                                Non assigné
                              </Badge>
                              {/* Indicateur priorité */}
                              {['VIP', 'Influenceur', 'Staff'].includes(client.clientType) && (
                                <div className="mt-1">
                                  <Badge bg="danger" className="fs-6">
                                    Prioritaire
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <Dropdown>
                            <Dropdown.Toggle 
                              variant="outline-primary" 
                              size="sm"
                              className="btn-no-caret"
                            >
                              ⚙️
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              {onViewClient && (
                                <Dropdown.Item onClick={() => onViewClient(client)}>
                                  <FaEye className="me-2" />
                                  Voir détails
                                </Dropdown.Item>
                              )}
                              
                              {onEditClient && (
                                <Dropdown.Item onClick={() => onEditClient(client)}>
                                  <FaEdit className="me-2" />
                                  Modifier
                                </Dropdown.Item>
                              )}
                              
                              {onManualAssign && !client.assignedHotel && (
                                <Dropdown.Item onClick={() => onManualAssign(client)}>
                                  <FaHotel className="me-2" />
                                  Assigner manuellement
                                </Dropdown.Item>
                              )}
                              
                              {onManualAssign && client.assignedHotel && (
                                <Dropdown.Item onClick={() => onManualAssign(client)}>
                                  <FaMapMarkerAlt className="me-2" />
                                  Réassigner
                                </Dropdown.Item>
                              )}
                              
                              <Dropdown.Divider />
                              
                              {onDeleteClient && (
                                <Dropdown.Item 
                                  onClick={() => {
                                    if (window.confirm(`Supprimer le client ${client.firstName} ${client.lastName} ?\n\nCette action est irréversible.`)) {
                                      onDeleteClient(client._id);
                                    }
                                  }}
                                  className="text-danger"
                                >
                                  <FaTrash className="me-2" />
                                  Supprimer
                                </Dropdown.Item>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      ) : (
        /* 🗂️ VUE EN CARTES */
        <Row>
          {filteredClients.length === 0 ? (
            <Col>
              <Card className="text-center py-5">
                <Card.Body>
                  <FaUsers size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">Aucun client trouvé</h5>
                  <p className="text-muted">
                    {searchTerm || filterGender !== 'all' || filterType !== 'all' 
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Commencez par ajouter des clients ou importer un fichier CSV'}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            filteredClients.map(client => {
              const groupSize = client.groupName ? (groupSizes[client.groupName] || 1) : 1;
              const isSelected = selectedClients.includes(client._id);
              const typeConfig = getClientTypeBadge(client.clientType);
              const statusConfig = getStatusBadge(client.status);
              const genderConfig = getGenderBadge(client.gender);

              return (
                <Col key={client._id} lg={4} md={6} className="mb-3">
                  <Card 
                    className={`h-100 ${isSelected ? 'border-primary shadow' : ''} ${client.clientType === 'VIP' ? 'border-warning' : ''}`}
                    style={{ cursor: onSelectClient ? 'pointer' : 'default' }}
                    onClick={() => onSelectClient && onSelectClient(client)}
                  >
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {onSelectMultiple && (
                          <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              onSelectMultiple(client._id);
                            }}
                            className="me-2"
                          />
                        )}
                        <Badge bg={typeConfig.bg} className="d-flex align-items-center">
                          {typeConfig.icon}
                          <span className="ms-1">{client.clientType}</span>
                        </Badge>
                      </div>
                      
                      <Badge bg={genderConfig.bg} className="d-flex align-items-center">
                        {genderConfig.icon}
                        <span className="ms-1">{client.gender}</span>
                      </Badge>
                    </Card.Header>
                    
                    <Card.Body>
                      {/* NOM ET PRÉNOM */}
                      <h6 className="mb-2">
                        {client.firstName} {client.lastName}
                        {client.clientType === 'VIP' && (
                          <FaCrown className="ms-2 text-warning" />
                        )}
                      </h6>

                      {/* CONTACT */}
                      <div className="mb-2">
                        <div className="d-flex align-items-center mb-1">
                          <FaPhone className="me-2 text-muted" size={14} />
                          <span className="font-monospace small">{client.phone}</span>
                        </div>
                        {client.email && (
                          <div className="d-flex align-items-center">
                            <FaEnvelope className="me-2 text-muted" size={14} />
                            <small className="text-muted text-truncate">
                              {client.email}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* GROUPE */}
                      <div className="mb-2">
                        {client.groupName ? (
                          <div>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <FaUsers className="me-1 text-primary" size={14} />
                                <span className="fw-bold text-primary">{client.groupName}</span>
                              </div>
                              <Badge bg="info" className="fs-6">{groupSize}</Badge>
                            </div>
                            {client.groupRelation && (
                              <small className="text-muted">{client.groupRelation}</small>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-between">
                            <Badge bg="secondary" className="d-flex align-items-center">
                              <FaUser className="me-1" />
                              Solo
                            </Badge>
                            <Badge bg="secondary" className="fs-6">1</Badge>
                          </div>
                        )}
                      </div>

                      {/* STATUT */}
                      <div className="mb-2">
                        <Badge 
                          bg={statusConfig.bg} 
                          className="d-flex align-items-center w-100 justify-content-center"
                        >
                          <span className="me-1">{statusConfig.icon}</span>
                          {client.status}
                        </Badge>
                      </div>

                      {/* HÔTEL ASSIGNÉ */}
                      {client.assignedHotel ? (
                        <div className="mb-2">
                          <div className="d-flex align-items-center">
                            <FaHotel className="me-1 text-success" size={14} />
                            <span className="fw-bold text-success small">
                              {client.assignedHotel.name}
                            </span>
                          </div>
                          {client.logicalRoomId && (
                            <div className="d-flex align-items-center mt-1">
                              <FaBed className="me-1 text-muted" size={12} />
                              <small className="text-muted">
                                Chambre: {client.logicalRoomId}
                              </small>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-2 text-center">
                          <Badge bg="outline-warning" className="w-100">
                            <FaMapMarkerAlt className="me-1" />
                            Non assigné
                          </Badge>
                          {['VIP', 'Influenceur', 'Staff'].includes(client.clientType) && (
                            <Badge bg="danger" className="w-100 mt-1 fs-6">
                              Prioritaire
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* NOTES */}
                      {client.notes && (
                        <div className="mb-2">
                          <small className="text-info">
                            📝 {client.notes.substring(0, 80)}
                            {client.notes.length > 80 && '...'}
                          </small>
                        </div>
                      )}
                    </Card.Body>

                    {/* ACTIONS */}
                    <Card.Footer className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {onViewClient && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Voir détails</Tooltip>}
                        >
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => onViewClient(client)}
                          >
                            <FaEye />
                          </Button>
                        </OverlayTrigger>
                      )}
                      
                      {onEditClient && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Modifier</Tooltip>}
                        >
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => onEditClient(client)}
                          >
                            <FaEdit />
                          </Button>
                        </OverlayTrigger>
                      )}
                      
                      {onManualAssign && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{client.assignedHotel ? 'Réassigner' : 'Assigner'}</Tooltip>}
                        >
                          <Button 
                            variant={client.assignedHotel ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={() => onManualAssign(client)}
                          >
                            <FaHotel />
                          </Button>
                        </OverlayTrigger>
                      )}
                      
                      {onDeleteClient && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Supprimer</Tooltip>}
                        >
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Supprimer ${client.firstName} ${client.lastName} ?`)) {
                                onDeleteClient(client._id);
                              }
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </OverlayTrigger>
                      )}
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
      )}

      {/* 📊 RÉSUMÉ AVANCÉ DES GROUPES */}
      {groupsInfo.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h6 className="mb-0">
              <FaUserFriends className="me-2" />
              Analyse des Groupes ({groupsInfo.length})
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              {groupsInfo.slice(0, 6).map(group => (
                <Col key={group.name} lg={4} md={6} className="mb-3">
                  <Card className={`border-${group.mixed ? 'warning' : 'info'} h-100`}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 text-truncate">{group.name}</h6>
                        <Badge bg="info" className="ms-2">{group.members.length}</Badge>
                      </div>
                      
                      <div className="d-flex gap-2 mb-2">
                        {Array.from(group.genders).map(gender => (
                          <Badge key={gender} bg={getGenderBadge(gender).bg} className="fs-6">
                            {getGenderBadge(gender).icon}
                            <span className="ms-1">
                              {group.members.filter(m => m.gender === gender).length}
                            </span>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="d-flex gap-1 mb-2">
                        {Array.from(group.types).map(type => (
                          <Badge key={type} bg={getClientTypeBadge(type).bg} className="fs-6">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {group.assigned}/{group.members.length} assignés
                        </small>
                        <div className="d-flex gap-1">
                          {group.mixed && (
                            <Badge bg="warning" className="fs-6">
                              <FaExclamationTriangle size={10} className="me-1" />
                              Mixte
                            </Badge>
                          )}
                          {group.priority && (
                            <Badge bg="danger" className="fs-6">
                              <FaCrown size={10} className="me-1" />
                              Priorité
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {groupsInfo.length > 6 && (
              <div className="text-center mt-3">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    // Afficher tous les groupes ou modal détaillée
                    console.log('Afficher tous les groupes:', groupsInfo);
                  }}
                >
                  Voir tous les groupes ({groupsInfo.length})
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* 🚨 ALERTES ET NOTIFICATIONS */}
      {stats.priority > 0 && stats.priority > stats.assigned && (
        <Alert variant="warning" className="mt-4">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            <div>
              <strong>Attention !</strong> {stats.priority - stats.assigned} clients prioritaires 
              (VIP, Influenceurs, Staff) ne sont pas encore assignés.
            </div>
          </div>
        </Alert>
      )}

      {stats.mixedGroups > 0 && (
        <Alert variant="info" className="mt-4">
          <div className="d-flex align-items-center">
            <FaUsers className="me-2" />
            <div>
              <strong>Groupes mixtes détectés !</strong> {stats.mixedGroups} groupes contiennent 
              des hommes et des femmes. Ils nécessitent des chambres VIP ou une séparation.
            </div>
          </div>
        </Alert>
      )}

      {filteredClients.length > 0 && selectedClients.length > 0 && (
        <Alert variant="primary" className="mt-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{selectedClients.length} client(s) sélectionné(s)</strong>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => {
                  // Action groupée - export, assignation, etc.
                  console.log('Action groupée pour:', selectedClients);
                }}
              >
                Actions groupées
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  // Désélectionner tout
                  selectedClients.forEach(id => onSelectMultiple(id));
                }}
              >
                Désélectionner
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* 📈 PAGINATION (si nécessaire pour de gros volumes) */}
      {filteredClients.length > 50 && (
        <div className="mt-4 text-center">
          <small className="text-muted">
            Affichage de {filteredClients.length} clients
            {filteredClients.length !== stats.total && ` (${stats.total} au total)`}
          </small>
        </div>
      )}
    </div>
  );
};

// 🎨 STYLES PERSONNALISÉS
const customStyles = `
  .btn-no-caret::after {
    display: none !important;
  }
  
  .table-responsive {
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--bs-dark) !important;
  }
  
  .client-card:hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
  
  .badge-outline-warning {
    color: #f0ad4e;
    border: 1px solid #f0ad4e;
    background-color: transparent;
  }
  
  .badge-outline-info {
    color: #5bc0de;
    border: 1px solid #5bc0de;
    background-color: transparent;
  }
  
  .font-monospace {
    font-family: 'Courier New', monospace;
  }
  
  .text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// Injecter les styles personnalisés
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

// 🎯 PROPS VALIDATION
ClientsList.defaultProps = {
  clients: [],
  selectedClients: [],
  loading: false,
  onSelectClient: null,
  onEditClient: null,
  onDeleteClient: null,
  onManualAssign: null,
  onViewClient: null,
  onSelectMultiple: null,
  eventId: null
};

export default ClientsList;
