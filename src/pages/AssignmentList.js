import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiUsers, FiMapPin, FiBarChart3, FiPlus } from 'react-icons/fi';
import eventService from '../services/eventService';

const AssignmentList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents();
      if (response.success) {
        setEvents(response.data);
      } else {
        setError('Erreur lors du chargement des événements');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <FiMapPin className="me-2" />
              Gestion des Assignations
            </h1>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Row>
            <Col md={12} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <FiUsers className="me-2" />
                    Événements - Assignations de chambres
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted mb-3">
                    Sélectionnez un événement pour gérer les assignations de chambres d'hôtel.
                  </p>
                  
                  {events.length === 0 ? (
                    <Alert variant="info">
                      <h6>Aucun événement disponible</h6>
                      <p className="mb-2">Vous devez d'abord créer un événement avant de pouvoir gérer les assignations.</p>
                      <Link to="/events/new" className="btn btn-primary btn-sm">
                        <FiPlus className="me-1" />
                        Créer un événement
                      </Link>
                    </Alert>
                  ) : (
                    <Row>
                      {events.map(event => (
                        <Col md={6} lg={4} key={event._id} className="mb-3">
                          <Card className="h-100 shadow-sm">
                            <Card.Body>
                              <h6 className="card-title">{event.name}</h6>
                              <p className="text-muted small mb-2">
                                📍 {event.city}, {event.country}
                              </p>
                              <p className="text-muted small mb-2">
                                📅 {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                              </p>
                              
                              <div className="mb-3">
                                <small className="text-muted">
                                  👥 {event.participantsCount || 0} participants
                                </small>
                              </div>

                              <div className="d-grid gap-2">
                                <Link 
                                  to={`/assignments/${event._id}`} 
                                  className="btn btn-primary btn-sm"
                                >
                                  <FiMapPin className="me-1" />
                                  Gérer les assignations
                                </Link>
                                
                                <Link 
                                  to={`/assignments/${event._id}/stats`} 
                                  className="btn btn-outline-info btn-sm"
                                >
                                  <FiBarChart3 className="me-1" />
                                  Voir les statistiques
                                </Link>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Card d'information */}
          <Row>
            <Col md={12}>
              <Card className="border-info">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">ℹ️ Comment ça fonctionne ?</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <h6>1. Événements</h6>
                      <p className="small text-muted">
                        Chaque événement peut avoir plusieurs hôtels et clients associés.
                      </p>
                    </Col>
                    <Col md={4}>
                      <h6>2. Assignation</h6>
                      <p className="small text-muted">
                        Assignez automatiquement ou manuellement les clients aux chambres d'hôtel.
                      </p>
                    </Col>
                    <Col md={4}>
                      <h6>3. Gestion</h6>
                      <p className="small text-muted">
                        Déplacez, échangez et optimisez les assignations selon vos besoins.
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignmentList;