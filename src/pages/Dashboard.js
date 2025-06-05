import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHotel, FaUsers, FaCalendarAlt, FaBed } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api'; // ✅ Correct

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalClients: 0,
    activeEvents: 0,
    assignedRooms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      // 🔧 CORRIGÉ : URLs complètes vers votre backend Render
      const [hotelsRes, clientsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/hotels`).catch(() => ({ json: () => ({ data: [] }) })),
        fetch(`${API_BASE_URL}/api/clients`).catch(() => ({ json: () => ({ data: [] }) })),
        fetch(`${API_BASE_URL}/api/events`).catch(() => ({ json: () => ({ data: [] }) }))
      ]);

      const hotels = await hotelsRes.json();
      const clients = await clientsRes.json();
      const events = await eventsRes.json();

      console.log('Données reçues:', { hotels, clients, events });

      setStats({
        totalHotels: hotels.data?.length || 0,
        totalClients: clients.data?.length || 0,
        activeEvents: events.data?.length || 0,
        assignedRooms: 0
      });
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
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
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>👋 Bonjour {user?.firstName || 'Utilisateur'} !</h2>
          <p className="text-muted">Voici un aperçu de votre activité StudiMove Hotel</p>
        </Col>
      </Row>

      {/* Statistiques principales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-primary h-100">
            <Card.Body className="text-center">
              <FaHotel size={40} className="text-primary mb-3" />
              <h3 className="mb-1 text-dark">{stats.totalHotels}</h3>
              <p className="text-muted mb-0">Hôtels partenaires</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-success h-100">
            <Card.Body className="text-center">
              <FaUsers size={40} className="text-success mb-3" />
              <h3 className="mb-1 text-dark">{stats.totalClients}</h3>
              <p className="text-muted mb-0">Clients enregistrés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-info h-100">
            <Card.Body className="text-center">
              <FaCalendarAlt size={40} className="text-info mb-3" />
              <h3 className="mb-1 text-dark">{stats.activeEvents}</h3>
              <p className="text-muted mb-0">Événements actifs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-warning h-100">
            <Card.Body className="text-center">
              <FaBed size={40} className="text-warning mb-3" />
              <h3 className="mb-1 text-dark">{stats.assignedRooms}</h3>
              <p className="text-muted mb-0">Chambres assignées</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actions rapides */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">🚀 Actions rapides</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="d-grid">
                    <Button as={Link} to="/events" variant="primary" size="lg">
                      <FaCalendarAlt className="me-2" />
                      Voir événements
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <Button as={Link} to="/hotels" variant="success" size="lg">
                      <FaHotel className="me-2" />
                      Voir hôtels
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <Button as={Link} to="/clients" variant="info" size="lg">
                      <FaUsers className="me-2" />
                      Voir clients  
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <Button variant="outline-secondary" size="lg" disabled>
                      <FaBed className="me-2" />
                      Assignations
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Message d'activité simple */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">📊 Aperçu</h5>
            </Card.Header>
            <Card.Body>
              <p>Vos données seront affichées ici une fois les APIs configurées correctement.</p>
              <p className="text-muted">
                ✅ API Health : Fonctionnelle<br/>
                ❌ API Hotels/Clients : Nécessitent correction côté backend
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
