import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaFileImport } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients');
      const data = await response.json();
      
      if (data.success) {
        setClients(data.data || []);
      } else {
        setError(data.message || 'Erreur lors du chargement des clients');
      }
    } catch (error) {
      console.error('Erreur fetch clients:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

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
      console.error('Erreur suppression:', error);
      toast.error('Erreur de connexion');
    }
  };

  const getClientTypeBadge = (type) => {
    const variants = {
      'Solo': 'secondary',
      'Groupe': 'info',
      'VIP': 'warning',
      'Staff': 'primary'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'En attente': 'warning',
      'Assigné': 'success',
      'Confirmé': 'primary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaUsers className="me-2" />
          Liste des Clients ({clients.length})
        </h2>
        <div>
          <Button variant="outline-success" className="me-2">
            <FaFileImport className="me-2" />
            Importer CSV
          </Button>
          <Button variant="primary">
            <FaPlus className="me-2" />
            Ajouter un Client
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {clients.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaUsers size={48} className="mb-3" />
          <h5>Aucun client trouvé</h5>
          <p>Commencez par ajouter vos premiers clients.</p>
          <Button variant="primary">
            <FaPlus className="me-2" />
            Ajouter un Client
          </Button>
        </Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Type</th>
              <th>Groupe</th>
              <th>Statut</th>
              <th>Hôtel assigné</th>
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
                <td>{getClientTypeBadge(client.type)}</td>
                <td>
                  {client.groupName ? (
                    <span>
                      {client.groupName}
                      <small className="text-muted"> ({client.groupSize})</small>
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>{getStatusBadge(client.status)}</td>
                <td>
                  {client.assignedHotel ? (
                    <span className="text-success">{client.assignedHotel.name}</span>
                  ) : (
                    <span className="text-muted">Non assigné</span>
                  )}
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <Button variant="outline-warning" title="Modifier">
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      onClick={() => handleDelete(client._id)}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ClientList;