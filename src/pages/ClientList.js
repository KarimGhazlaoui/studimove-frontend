import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaPlus, FaSearch, FaEdit, FaTrash, FaUpload, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, typeFilter, statusFilter]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      
      if (data.success) {
        setClients(data.data);
      } else {
        toast.error('Erreur lors du chargement des clients');
      }
    } catch (error) {
      console.error('Erreur fetch clients:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

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
      filtered = filtered.filter(client => client.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast.success('Client supprimé avec succès');
          fetchClients();
        } else {
          toast.error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur delete client:', error);
        toast.error('Erreur de connexion');
      }
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', csvFile);

    try {
      const response = await fetch('/api/clients/import-csv', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`${data.imported} client(s) importé(s) avec succès`);
        if (data.errors.length > 0) {
          toast.warning(`${data.errors.length} erreur(s) détectée(s)`);
        }
        fetchClients();
        setShowImportModal(false);
        setCsvFile(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Erreur import CSV:', error);
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
      'Solo': 'info',
      'Groupe': 'primary',
      'VIP': 'warning',
      'Influenceur': 'danger',
      'Staff': 'success'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
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
              <p className="text-muted">Gérez votre base de clients StudiMove</p>
            </div>
            <div className="btn-group">
              <Button 
                variant="outline-success"
                onClick={() => setShowImportModal(true)}
              >
                <FaUpload className="me-2" />
                Importer CSV
              </Button>
              <Button as={Link} to="/clients/new" variant="primary">
                <FaPlus className="me-2" />
                Nouveau Client
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filtres */}
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
            <option value="Solo">Solo</option>
            <option value="Groupe">Groupe</option>
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

      {/* Tableau des clients */}
      <Row>
        <Col>
          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Type</th>
                  <th>Groupe</th>
                  <th>Taille</th>
                  <th>Statut</th>
                  <th>Hôtel assigné</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(client => (
                  <tr key={client._id}>
                    <td>
                      <strong>{client.firstName} {client.lastName}</strong>
                    </td>
                    <td>{client.phone}</td>
                    <td>{getTypeBadge(client.type)}</td>
                    <td>{client.groupName || '-'}</td>
                    <td className="text-center">{client.groupSize}</td>
                    <td>{getStatusBadge(client.status)}</td>
                    <td>
                      {client.assignedHotel ? (
                        <span className="text-success">
                          {client.assignedHotel.name}
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
                ))}
              </tbody>
            </Table>
          </div>

          {filteredClients.length === 0 && !loading && (
            <div className="text-center py-5">
              <FaUsers size={64} className="text-muted mb-3" />
              <h4 className="text-muted">Aucun client trouvé</h4>
              <p className="text-muted">Commencez par ajouter votre premier client</p>
              <Button as={Link} to="/clients/new" variant="primary">
                <FaPlus className="me-2" />
                Ajouter un client
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Modal d'import CSV */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUpload className="me-2" />
            Importer des clients depuis CSV
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Fichier CSV</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
              />
              <Form.Text className="text-muted">
                Format requis: prenom, nom, telephone, groupe, taille_groupe, notes
              </Form.Text>
            </Form.Group>
            
            <div className="alert alert-info">
              <strong>Format CSV attendu:</strong>
              <ul className="mb-0 mt-2">
                <li><strong>prenom</strong>: Prénom du client</li>
                <li><strong>nom</strong>: Nom du client</li>
                <li><strong>telephone</strong>: Numéro de téléphone</li>
                <li><strong>groupe</strong>: Nom du groupe ou "solo"</li>
                <li><strong>taille_groupe</strong>: Nombre de personnes</li>
                <li><strong>notes</strong>: Notes optionnelles</li>
              </ul>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleImportCSV}>
            <FaUpload className="me-2" />
            Importer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClientList;
