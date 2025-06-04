import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHotel, FaUsers, FaCalendarAlt, FaBed, FaPlus, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity')
      ]);
      
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();
      
      setStats(statsData.stats);
      setRecentActivity(activityData.activities || []);
    } catch (error) {
      console.error('Erreur dashboard:', error);
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
          <h2>
            👋 Bonjour {user?.firstName || 'Utilisateur'} !
          </h2>
          <p className="text-muted">Voici un aperçu de votre activité StudiMove Hotel</p>
        </Col>
      </Row>

      {/* Statistiques principales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card border-primary">
            <Card.Body className="text-center">
              <FaHotel size={40} className="text-primary mb-3" />
              <h3 className="mb-1">{stats?.totalHotels || 0}</h3>
              <p className="text-muted mb-0">Hôtels partenaires</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card border-success">
            <Card.Body className="text-center">
              <FaUsers size={40} className="text-success mb-3" />
              <h3 className="mb-1">{stats?.totalClients || 0}</h3>
              <p className="text-muted mb-0">Clients enregistrés</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card border-info">
            <Card.Body className="text-center">
              <FaCalendarAlt size={40} className="text-info mb-3" />
              <h3 className="mb-1">{stats?.activeEvents || 0}</h3>
              <p className="text-muted mb-0">Événements actifs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card border-warning">
            <Card.Body className="text-center">
              <FaBed size={40} className="text-warning mb-3" />
              <h3 className="mb-1">{stats?.assignedRooms || 0}</h3>
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
                    <Button as={Link} to="/events/new" variant="primary" size="lg">
                      <FaPlus className="me-2" />
                      Nouvel événement
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <Button as={Link} to="/hotels/new" variant="success" size="lg">
                      <FaHotel className="me-2" />
                      Ajouter un hôtel
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <Button as={Link} to="/clients/new" variant="info" size="lg">
                      <FaUsers className="me-2" />
                      Nouveau client
                    </Button>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="d-grid">
                    <Button as={Link} to="/assignments/new" variant="warning" size="lg">
                      <FaBed className="me-2" />
                      Assignation
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activité récente et graphiques */}
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📊 Tendances récentes</h5>
              <Button variant="outline-primary" size="sm">
                <FaChartLine className="me-1" />
                Voir plus
              </Button>
            </Card.Header>
            <Card.Body>
              {stats?.trends ? (
                <div className="trends-chart">
                  <Row>
                    <Col md={6}>
                      <div className="trend-item mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Réservations cette semaine</span>
                          <strong className="text-success">+{stats.trends.weeklyBookings}%</strong>
                        </div>
                        <div className="progress mt-1">
                          <div className="progress-bar bg-success" style={{ width: `${stats.trends.weeklyBookings}%` }}></div>
                        </div>
                      </div>
                      <div className="trend-item mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Taux d'occupation</span>
                          <strong className="text-info">{stats.trends.occupancyRate}%</strong>
                        </div>
                        <div className="progress mt-1">
                          <div className="progress-bar bg-info" style={{ width: `${stats.trends.occupancyRate}%` }}></div>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="trend-item mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Nouveaux clients</span>
                          <strong className="text-warning">+{stats.trends.newClients}</strong>
                        </div>
                        <div className="progress mt-1">
                          <div className="progress-bar bg-warning" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div className="trend-item mb-3">
                        <div className="d-flex justify-content-between">
                          <span>Satisfaction client</span>
                          <strong className="text-primary">{stats.trends.satisfaction}/5</strong>
                        </div>
                        <div className="progress mt-1">
                          <div className="progress-bar bg-primary" style={{ width: `${(stats.trends.satisfaction / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <p className="text-muted text-center">Aucune donnée de tendance disponible</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">🕐 Activité récente</h5>
            </Card.Header>
            <Card.Body>
              {recentActivity.length > 0 ? (
                <div className="activity-feed">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item mb-3 pb-3 border-bottom">
                      <div className="d-flex">
                        <div className="activity-icon me-3">
                          {activity.type === 'hotel' && <FaHotel className="text-primary" />}
                          {activity.type === 'client' && <FaUsers className="text-success" />}
                          {activity.type === 'assignment' && <FaBed className="text-warning" />}
                          {activity.type === 'event' && <FaCalendarAlt className="text-info" />}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small">{activity.description}</p>
                          <small className="text-muted">{activity.timeAgo}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">Aucune activité récente</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
