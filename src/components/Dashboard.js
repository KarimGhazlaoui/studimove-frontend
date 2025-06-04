import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaHotel, FaUsers, FaPlus, FaChartLine } from 'react-icons/fa';
import { hotelService, clientService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalClients: 0,
    clientsAssigned: 0,
    clientsPending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [hotelsResponse, clientsResponse] = await Promise.all([
        hotelService.getAllHotels(),
        clientService.getAllClients()
      ]);

      const clients = clientsResponse.data;
      const clientsAssigned = clients.filter(c => c.status === 'Assigné' || c.status === 'Confirmé').length;
      const clientsPending = clients.filter(c => c.status === 'En attente').length;

      setStats({
        totalHotels: hotelsResponse.data.length,
        totalClients: clients.length,
        clientsAssigned,
        clientsPending
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
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
            <FaChartLine className="me-2" />
            Tableau de Bord StudiMove
          </h1>
        </Col>
      </Row>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaHotel size={40} className="text-primary mb-3" />
              <h3 className="text-primary">{stats.totalHotels}</h3>
              <p className="mb-0">Hôtels</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsers size={40} className="text-success mb-3" />
              <h3 className="text-success">{stats.totalClients}</h3>
              <p className="mb-0">Clients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsers size={40} className="text-info mb-3" />
              <h3 className="text-info">{stats.clientsAssigned}</h3>
              <p className="mb-0">Clients Assignés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <FaUsers size={40} className="text-warning mb-3" />
              <h3 className="text-warning">{stats.clientsPending}</h3>
              <p className="mb-0">En Attente</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actions rapides */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaHotel className="me-2" />
                Gestion des Hôtels
              </h5>
            </Card.Header>
            <Card.Body>
              <p>Gérez vos hôtels, chambres et disponibilités.</p>
              <div className="d-flex gap-2">
                <Button variant="primary" href="/hotels">
                  Voir les Hôtels
                </Button>
                <Button variant="outline-primary" href="/hotels/add">
                  <FaPlus className="me-1" />
                  Nouveau
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaUsers className="me-2" />
                Gestion des Clients
              </h5>
            </Card.Header>
            <Card.Body>
              <p>Gérez vos clients et leurs réservations.</p>
              <div className="d-flex gap-2">
                <Button variant="success" href="/clients">
                  Voir les Clients
                </Button>
                <Button variant="outline-success" href="/clients/add">
                  <FaPlus className="me-1" />
                  Nouveau
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
