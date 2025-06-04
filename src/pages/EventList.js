import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaCalendarAlt, FaUsers, FaBed, FaSearch, FaEdit, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
      } else {
        toast.error('Erreur lors du chargement des événements');
      }
    } catch (error) {
      console.error('Erreur fetch events:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'draft': 'secondary',
      'active': 'success',
      'completed': 'primary',
      'cancelled': 'danger'
    };
    
    const labels = {
      'draft': 'Brouillon',
      'active': 'Actif',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };

    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaCalendarAlt className="me-2" />
                Gestion des Événements
              </h2>
              <p className="text-muted">Gérez vos événements StudiMove</p>
            </div>
            <Button as={Link} to="/events/new" variant="primary" size="lg">
              <FaPlus className="me-2" />
              Nouvel Événement
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filtres */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="active">Actifs</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <div className="text-end">
            <small className="text-muted">
              {filteredEvents.length} événement(s) trouvé(s)
            </small>
          </div>
        </Col>
      </Row>

      {/* Liste des événements */}
      <Row>
        {filteredEvents.map(event => (
          <Col key={event._id} lg={4} md={6} className="mb-4">
            <Card className="h-100 event-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>{event.name}</strong>
                {getStatusBadge(event.status)}
              </Card.Header>
              
              <Card.Body>
                <div className="event-info mb-3">
                  <p className="mb-2">
                    <strong>📍 Lieu:</strong> {event.location}
                  </p>
                  <p className="mb-2">
                    <strong>📅 Dates:</strong><br />
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <strong>👥 Participants:</strong> {event.participantCount || 0}
                  </p>
                </div>

                <div className="event-stats">
                  <Row className="text-center">
                    <Col>
                      <div className="stat-item">
                        <FaUsers className="text-primary" />
                        <br />
                        <small>{event.stats?.totalClients || 0}</small>
                        <br />
                        <small className="text-muted">Clients</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="stat-item">
                        <FaBed className="text-success" />
                        <br />
                        <small>{event.stats?.assignedRooms || 0}</small>
                        <br />
                        <small className="text-muted">Chambres</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="stat-item">
                        <FaCalendarAlt className="text-info" />
                        <br />
                        <small>{event.stats?.daysLeft || 0}</small>
                        <br />
                        <small className="text-muted">Jours</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>

              <Card.Footer className="d-flex justify-content-between">
                <Button 
                  as={Link} 
                  to={`/events/${event._id}`}
                  variant="outline-primary" 
                  size="sm"
                >
                  <FaEye className="me-1" />
                  Voir
                </Button>
                
                <div className="btn-group">
                  <Button 
                    as={Link} 
                    to={`/events/${event._id}/edit`}
                    variant="outline-secondary" 
                    size="sm"
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    as={Link} 
                    to={`/assignments/${event._id}`}
                    variant="outline-warning" 
                    size="sm"
                  >
                    <FaBed />
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredEvents.length === 0 && !loading && (
        <Row>
          <Col className="text-center py-5">
            <FaCalendarAlt size={64} className="text-muted mb-3" />
            <h4 className="text-muted">Aucun événement trouvé</h4>
            <p className="text-muted">Commencez par créer votre premier événement</p>
            <Button as={Link} to="/events/new" variant="primary">
              <FaPlus className="me-2" />
              Créer un événement
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default EventList;