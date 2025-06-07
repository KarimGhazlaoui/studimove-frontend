import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, InputGroup, Badge, Modal, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaPlus, FaSearch, FaEdit, FaTrash, FaUpload, FaDownload, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { clientService, eventService } from '../services/api';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [error, setError] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🔧 Fonction pour récupérer les clients
  const fetchClients = async () => {
    if (!selectedEventId) {
      setClients([]);
      setFilteredClients([]);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Récupération des clients pour événement:', selectedEventId);
      
      const data = await clientService.getAllClients({ eventId: selectedEventId });
      
      console.log('✅ Clients reçus:', data);
      
      if (data.success) {
        setClients(data.data || []);
        setFilteredClients(data.data || []);
      } else {
        toast.error(data.message || 'Erreur lors du chargement des clients');
        setError(data.message);
      }
    } catch (error) {
      console.error('Erreur fetch clients:', error);
      toast.error('Erreur de connexion au serveur');
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // 🔧 Fonction pour récupérer les événements
  const fetchEvents = async () => {
    try {
      const data = await eventService.getAllEvents();
      if (data.success) {
        setEvents(data.data || []);
        if (data.data && data.data.length > 0) {
          const firstEvent = data.data[0];
          setSelectedEventId(firstEvent._id);
          setSelectedEvent(firstEvent);
        }
      }
    } catch (error) {
      console.error('Erreur fetch events:', error);
      toast.error('Erreur lors du chargement des événements');
    }
  };

  // 🔧 Fonction pour filtrer les clients
  const filterClients = () => {
    let filtered = clients;
    
    if (searchTerm) {
      filtered = filtered.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.groupName && client.groupName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(client => client.clientType === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }
    
    setFilteredClients(filtered);
  };

  // 🔧 UseEffect pour charger les événements au montage
  useEffect(() => {
    fetchEvents();
  }, []); // ✅ Dépendances vides

  // 🔧 UseEffect pour charger les clients quand l'événement change
  useEffect(() => {
    if (selectedEventId) {
      fetchClients();
    } else {
      setClients([]);
      setFilteredClients([]);
    }
  }, [selectedEventId]); // ✅ Supprimé fetchClients des dépendances

  // 🔧 UseEffect pour filtrer les clients
  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, typeFilter, statusFilter]); // ✅ Supprimé filterClients des dépendances

  // 🔧 Gérer le changement d'événement
  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    const event = events.find(e => e._id === eventId);
    setSelectedEvent(event);
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }
    
    try {
      const result = await clientService.deleteClient(clientId);
      if (result.success) {
        toast.success('Client supprimé avec succès');
        fetchClients();
      } else {
        toast.error(result.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteAllClients = async () => {
    if (!selectedEventId || !selectedEvent) return;
    
    setDeleteLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/clients/event/${selectedEventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`${data.deletedCount} clients supprimés de "${selectedEvent.name}"`);
        setShowDeleteAllModal(false);
        fetchClients();
      } else {
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression masse:', error);
      toast.error('Erreur lors de la suppression des clients');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }
    if (!selectedEventId) {
      toast.error('Veuillez sélectionner un événement');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('eventId', selectedEventId);

    console.log('📤 Données envoyées:');
    console.log('- Fichier CSV:', csvFile.name, csvFile.size, 'bytes');
    console.log('- Event ID:', selectedEventId);

    try {
      const data = await clientService.importFromCSV(formData);
      
      console.log('📥 Réponse complète API:', data);
      
      if (data.success) {
        toast.success(`${data.data.imported || 0} client(s) importé(s) avec succès`);
        
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} erreur(s) détectée(s)`);
          console.log('📋 Liste des erreurs:', data.errors);
          
          const firstErrors = data.errors.slice(0, 5);
          alert('Erreurs détectées:\n' + firstErrors.join('\n'));
        }
        
        if (data.data.skipped > 0) {
          toast.info(`${data.data.skipped} client(s) ignoré(s) (déjà existants)`);
        }
        
        fetchClients();
        setShowImportModal(false);
        setCsvFile(null);
      } else {
        console.log('❌ Import échoué:', data.message);
        toast.error(data.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      console.error('💥 Erreur import CSV:', error);
      toast.error('Erreur lors de l\'import');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'En attente': 'warning',
      'Assigné': 'success',
      'Confirmé': 'primary',
      'Annulé': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      'Standard': 'info',
      'VIP': 'warning',
      'Influenceur': 'danger',
      'Staff': 'success'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const getGenderBadge = (gender) => {
    const variants = {
      'Homme': 'primary',
      'Femme': 'success'
    };
    return <Badge bg={variants[gender] || 'secondary'}>{gender}</Badge>;
  };

  const stats = {
    total: filteredClients.length,
    assigned: filteredClients.filter(c => c.assignedHotel).length,
    vips: filteredClients.filter(c => c.clientType === 'VIP').length,
    groups: [...new Set(filteredClients.filter(c => c.groupName).map(c => c.groupName))].length
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaUsers className="me-2" />
                Gestion des Clients
              </h2>
              {selectedEvent && (
                <p className="text-muted mb-0">
                  📅 Événement : <strong>{selectedEvent.name}</strong> • {selectedEvent.city}, {selectedEvent.country}
                </p>
              )}
            </div>
            <div className="btn-group">
              <Button
                variant="outline-success"
                onClick={() => setShowImportModal(true)}
                disabled={!selectedEventId}
              >
                <FaUpload className="me-2" />
                Importer CSV
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => setShowDeleteAllModal(true)}
                disabled={!selectedEventId || clients.length === 0}
              >
                <FaTrashAlt className="me-2" />
                Vider événement
              </Button>
              <Button as={Link} to="/clients/new" variant="primary">
                <FaPlus className="me-2" />
                Nouveau Client
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Sélecteur d'événement principal */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label><strong>📅 Sélectionner un événement</strong></Form.Label>
                <Form.Select 
                  value={selectedEventId} 
                  onChange={(e) => handleEventChange(e.target.value)}
                  size="lg"
                >
                  <option value="">-- Choisir un événement --</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.name} • {event.city}, {event.country} • {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date non définie'}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Stats rapides */}
        <Col md={6}>
          <Card className="bg-light">
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <h4 className="text-primary mb-0">{stats.total}</h4>
                  <small>Total clients</small>
                </Col>
                <Col>
                  <h4 className="text-success mb-0">{stats.assigned}</h4>
                  <small>Assignés</small>
                </Col>
                <Col>
                  <h4 className="text-warning mb-0">{stats.vips}</h4>
                  <small>VIPs</small>
                </Col>
                <Col>
                  <h4 className="text-info mb-0">{stats.groups}</h4>
                  <small>Groupes</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Message si pas d'événement sélectionné */}
      {!selectedEventId && (
        <Alert variant="info" className="text-center">
          <h5>📅 Veuillez sélectionner un événement pour voir les clients</h5>
          <p>Choisissez un événement dans la liste déroulante ci-dessus pour afficher ses clients.</p>
        </Alert>
      )}

      {/* Filtres - seulement si un événement est sélectionné */}
      {selectedEventId && (
        <Row className="mb-4">
          <Col md={4}>
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
          <Col md={2}>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tous types</option>
              <option value="Standard">Standard</option>
              <option value="VIP">VIP</option>
              <option value="Influenceur">Influenceur</option>
              <option value="Staff">Staff</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous statuts</option>
              <option value="En attente">En attente</option>
              <option value="Assigné">Assigné</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Annulé">Annulé</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button variant="outline-primary" size="sm">
              <FaDownload className="me-1" />
              Exporter
            </Button>
          </Col>
          <Col md={2}>
            <div className="text-end">
              <small className="text-muted">
                {filteredClients.length} client(s) trouvé(s)
              </small>
            </div>
          </Col>
        </Row>
      )}

      {/* Tableau des clients */}
      {selectedEventId && (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    📋 Liste des clients ({filteredClients.length})
                  </h5>
                  {selectedEvent && (
                    <Badge bg="primary" className="fs-6">
                      {selectedEvent.name}
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Nom</th>
                        <th>Contact</th>
                        <th>Sexe</th>
                        <th>Type</th>
                        <th>Groupe</th>
                        <th>Taille</th>
                        <th>Statut</th>
                        <th>Hôtel assigné</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">Chargement...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                          <tr key={client._id}>
                            <td>
                              <div>
                                <strong>{client.firstName} {client.lastName}</strong>
                                {client.eventId && (
                                  <div className="small text-muted">
                                    📅 {selectedEvent?.name || 'Événement'}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                📞 {client.phone}
                                {client.email && (
                                  <>
                                    <br />
                                    📧 {client.email}
                                  </>
                                )}
                              </div>
                            </td>
                            <td>{client.gender ? getGenderBadge(client.gender) : '-'}</td>
                            <td>{getTypeBadge(client.clientType || client.type)}</td>
                            <td>
                              {client.groupName ? (
                                <div>
                                  <strong>{client.groupName}</strong>
                                  <br />
                                  <small className="text-muted">{client.groupRelation || 'Groupe'}</small>
                                </div>
                              ) : (
                                <span className="text-muted">Solo</span>
                              )}
                            </td>
                            <td className="text-center">
                              <Badge bg="info">{client.groupSize || 1}</Badge>
                            </td>
                            <td>{getStatusBadge(client.status)}</td>
                            <td>
                              {client.assignedHotel ? (
                                <span className="text-success">
                                  <strong>{client.assignedHotel.name}</strong>
                                  {client.assignedHotel.address && (
                                    <div className="small text-muted">
                                      {client.assignedHotel.address}
                                    </div>
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted">Non assigné</span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <Button
                                  as={Link}
                                  to={`/clients/${client._id}/edit`}
                                  variant="outline-primary"
                                  size="sm"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(client._id)}
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-5">
                            <FaUsers size={64} className="text-muted mb-3" />
                            <h4 className="text-muted">Aucun client trouvé</h4>
                            <p className="text-muted">
                              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                                ? 'Aucun client ne correspond aux critères de recherche'
                                : selectedEvent 
                                  ? `Aucun client n'est encore inscrit à "${selectedEvent.name}"`
                                  : 'Commencez par ajouter votre premier client'
                              }
                            </p>
                            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                              <Button as={Link} to="/clients/new" variant="primary">
                                <FaPlus className="me-2" />
                                Ajouter un client
                              </Button>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal de confirmation pour suppression de masse */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaTrashAlt size={64} className="text-danger mb-3" />
            <h5>Supprimer tous les clients ?</h5>
            {selectedEvent && (
              <div>
                <p className="mb-2">
                  Vous êtes sur le point de supprimer <strong>TOUS</strong> les clients de l'événement :
                </p>
                <Alert variant="warning" className="mb-3">
                  <strong>📅 {selectedEvent.name}</strong><br />
                  📍 {selectedEvent.city}, {selectedEvent.country}<br />
                  👥 <strong>{clients.length} clients</strong> seront supprimés
                </Alert>
                <p className="text-danger">
                  <strong>⚠️ Cette action est irréversible !</strong>
                </p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAllClients}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Suppression...</span>
                </div>
                Suppression...
              </>
            ) : (
              <>
                <FaTrashAlt className="me-2" />
                Confirmer la suppression
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'import CSV */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUpload className="me-2" />
            Importer des clients depuis CSV
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Sélecteur d'événement */}
            <Form.Group className="mb-3">
              <Form.Label>Événement cible *</Form.Label>
              <Form.Select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                required
              >
                <option value="">-- Sélectionnez un événement --</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.name} - {event.city}, {event.country}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Les clients seront ajoutés à cet événement
              </Form.Text>
            </Form.Group>
            
            {/* Sélecteur de fichier CSV */}
            <Form.Group className="mb-3">
              <Form.Label>Fichier CSV *</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                required
              />
              <Form.Text className="text-muted">
                Sélectionnez un fichier CSV avec les colonnes requises
              </Form.Text>
            </Form.Group>
                    
            <div className="alert alert-info">
              <h6><strong>Format CSV requis :</strong></h6>
              <ul className="mb-0 mt-2">
                <li><strong>prenom</strong> : Prénom du client</li>
                <li><strong>nom</strong> : Nom du client</li>
                <li><strong>telephone</strong> : Numéro de téléphone (unique dans l'événement)</li>
                <li><strong>email</strong> : Adresse email (optionnel)</li>
                <li><strong>sexe</strong> : "Homme" ou "Femme"</li>
                <li><strong>type_client</strong> : "standard", "vip", "influenceur", "staff"</li>
                <li><strong>groupe</strong> : Nom du groupe (optionnel)</li>
                <li><strong>taille_groupe</strong> : Nombre de personnes dans le groupe</li>
                <li><strong>notes</strong> : Notes optionnelles</li>
              </ul>
            </div>
            
            <div className="alert alert-success">
              <h6><strong>💡 Exemples :</strong></h6>
              <div style={{fontFamily: 'monospace', fontSize: '0.85em'}}>
                <div>Marie,Martin,0612345678,marie@email.com,Femme,vip,VIP Team,3,Cliente prioritaire</div>
                <div>Jean,Dupont,0687654321,jean@email.com,Homme,influenceur,Influenceurs Paris,5,YouTuber</div>
                <div>Sophie,Durand,0634567890,,Femme,standard,,1,Cliente solo</div>
              </div>
            </div>
            
            <div className="alert alert-warning">
              <h6><strong>⚠️ Important :</strong></h6>
              <ul className="mb-0">
                <li><strong>L'événement</strong> est sélectionné ici, pas dans le CSV</li>
                <li><strong>Sexe</strong> : seulement "Homme" ou "Femme"</li>
                <li><strong>Taille du groupe</strong> : nombre automatiquement assigné</li>
                <li><strong>Types + Groupes</strong> : combinables (ex: VIP dans un groupe)</li>
                <li><strong>Téléphones uniques</strong> par événement</li>
                <li><strong>Encodage</strong> : UTF-8</li>
              </ul>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleImportCSV}
            disabled={!csvFile || !selectedEventId}
          >
            <FaUpload className="me-2" />
            Importer dans l'événement
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClientList;
