import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileImport, FaEye, FaUsers } from 'react-icons/fa';
import { clientService } from '../../services/api';
import { toast } from 'react-toastify';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await clientService.getAllClients(params);
      setClients(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async () => {
    try {
      await clientService.deleteClient(clientToDelete._id);
      toast.success('Client supprimé avec succès');
      fetchClients();
      setShowDeleteModal(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'En attente': 'warning',
      'Assigné': 'info',
      'Confirmé': 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTypeBadge = (type, groupName) => {
    if (type === 'Solo') {
      return <Badge bg="primary">Solo</Badge>;
    } else {
      return (
        <div>
          <Badge bg="success" className="me-1">Groupe</Badge>
          {groupName && (
            <Badge bg="info">{groupName}</Badge>
          )}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">
            <FaUsers className="me-2" />
            Gestion des Clients
          </h1>
          
          {/* Filtres et recherche */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher par nom, prénom, téléphone ou groupe..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">Tous les types</option>
                    <option value="Solo">Solo</option>
                    <option value="Groupe">Groupe</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="En attente">En attente</option>
                    <option value="Assigné">Assigné</option>
                    <option value="Confirmé">Confirmé</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Actions */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Button 
                variant="primary" 
                href="/clients/add"
                className="me-2"
              >
                <FaPlus className="me-1" />
                Nouveau Client
              </Button>
              <Button 
                variant="success" 
                href="/clients/import"
              >
                <FaFileImport className="me-1" />
                Importer CSV
              </Button>
            </div>
            <Alert variant="info" className="mb-0">
              <strong>{clients.length}</strong> client{clients.length > 1 ? 's' : ''} trouvé{clients.length > 1 ? 's' : ''}
            </Alert>
          </div>

          {/* Liste des clients */}
          <Card>
            <Card.Body className="p-0">
              {clients.length === 0 ? (
                <div className="text-center p-4">
                  <p className="mb-0">Aucun client trouvé</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Nom Complet</th>
                      <th>Téléphone</th>
                      <th>Type / Groupe</th>
                      <th>Taille</th>
                      <th>Statut</th>
                      <th>Hôtel Assigné</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client._id}>
                        <td>
                          <strong>{client.firstName} {client.lastName}</strong>
                        </td>
                        <td>{client.phone}</td>
                        <td>{getTypeBadge(client.type, client.groupName)}</td>
                        <td>
                          <Badge bg="secondary">{client.groupSize}</Badge>
                        </td>
                        <td>{getStatusBadge(client.status)}</td>
                        <td>
                          {client.assignedHotel ? (
                            <span>
                              {client.assignedHotel.name}
                              {client.assignedRoom && ` - ${client.assignedRoom}`}
                            </span>
                          ) : (
                            <Badge bg="light" text="dark">Non assigné</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            href={`/clients/${client._id}`}
                            className="me-1"
                            title="Voir détail"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            href={`/clients/edit/${client._id}`}
                            className="me-1"
                            title="Modifier"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setClientToDelete(client);
                              setShowDeleteModal(true);
                            }}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer le client{' '}
          <strong>
            {clientToDelete?.firstName} {clientToDelete?.lastName}
          </strong> ?
          {clientToDelete?.groupName && (
            <div className="mt-2">
              <small className="text-muted">
                Groupe: <strong>{clientToDelete.groupName}</strong>
              </small>
            </div>
          )}
          <br />
          <small className="text-danger">Cette action est irréversible.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClientList;
