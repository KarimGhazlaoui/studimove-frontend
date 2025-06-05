import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FaHotel, FaUsers, FaBed, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques depuis différentes APIs
      const [hotelsRes, clientsRes] = await Promise.all([
        fetch('/hotels'),
        fetch('/clients')
      ]);

      const hotelsData = await hotelsRes.json();
      const clientsData = await clientsRes.json();

      if (hotelsData.success && clientsData.success) {
        const hotels = hotelsData.data || [];
        const clients = clientsData.data || [];

        // Calculer les statistiques
        const totalRooms = hotels.reduce((sum, hotel) => {
          return sum + (hotel.roomTypes?.reduce((roomSum, rt) => roomSum + rt.quantity, 0) || 0);
        }, 0);

        const assignedClients = clients.filter(c => c.assignedHotel).length;
        const occupancyRate = totalRooms > 0 ? Math.round((assignedClients / (totalRooms * 2)) * 100) : 0;

        setStats({
          totalHotels: hotels.length,
          totalClients: clients.length,
          totalRooms,
          assignedClients,
          unassignedClients: clients.length - assignedClients,
          occupancyRate,
          recentClients: clients.slice(-5).reverse(),
          recentHotels: hotels.slice(-3).reverse()
        });
      } else {
        setError('Erreur lors du chargement des données');
      }
    } catch (error) {
      console.error('Erreur fetch stats:', error);
      setError('Erreur de connexion au serveur');
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

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>Dashboard</h2>
        <p className="text-muted">Vue d'ensemble de votre système de gestion hôtelière</p>
      </div>

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-primary">
            <Card.Body>
              <FaHotel size={32} className="text-primary mb-2" />
              <Card.Title className="h2">{stats.totalHotels}</Card.Title>
              <Card.Text>Hôtels partenaires</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/hotels" className="btn btn-outline-primary btn-sm">
                Voir les hôtels
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <FaUsers size={32} className="text-success mb-2" />
              <Card.Title className="h2">{stats.totalClients}</Card.Title>
              <Card.Text>Clients enregistrés</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/clients" className="btn btn-outline-success btn-sm">
                Voir les clients
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-info">
            <Card.Body>
              <FaBed size={32} className="text-info mb-2" />
              <Card.Title className="h2">{stats.totalRooms}</Card.Title>
              <Card.Text>Chambres disponibles</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/assignments" className="btn btn-outline-info btn-sm">
                Gérer les assignations
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <FaChartLine size={32} className="text-warning mb-2" />
              <Card.Title className="h2">{stats.occupancyRate}%</Card.Title>
              <Card.Text>Taux d'occupation</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <span className="text-muted small">
                {stats.assignedClients}/{stats.totalClients} clients assignés
              </span>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Sections récentes */}
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Hôtels récents</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentHotels.length === 0 ? (
                <p className="text-muted text-center py-3">
                  Aucun hôtel enregistré
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentHotels.map((hotel) => (
                    <div key={hotel._id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{hotel.name}</h6>
                          <small className="text-muted">{hotel.address}</small>
                        </div>
                        <Link 
                          to={`/hotels/${hotel._id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Voir
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/hotels" className="btn btn-primary btn-sm">
                Voir tous les hôtels
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Clients récents</h5>
            </Card.Header>
            <Card.Body>
              {stats.recentClients.length === 0 ? (
                <p className="text-muted text-center py-3">
                  Aucun client enregistré
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentClients.map((client) => (
                    <div key={client._id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{client.firstName} {client.lastName}</h6>
                          <small className="text-muted">
                            {client.type} • {client.phone}
                          </small>
                        </div>
                        <span className={`badge ${client.assignedHotel ? 'bg-success' : 'bg-warning'}`}>
                          {client.assignedHotel ? 'Assigné' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/clients" className="btn btn-success btn-sm">
                Voir tous les clients
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Actions rapides */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Actions rapides</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/hotels/add" className="btn btn-primary">
                  <FaHotel className="me-1" />
                  Ajouter un hôtel
                </Link>
                <Link to="/clients/add" className="btn btn-success">
                  <FaUsers className="me-1" />
                  Ajouter un client
                </Link>
                <Link to="/assignments" className="btn btn-info">
                  <FaBed className="me-1" />
                  Gérer les assignations
                </Link>
                <Link to="/reports" className="btn btn-outline-secondary">
                  <FaChartLine className="me-1" />
                  Voir les rapports
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;