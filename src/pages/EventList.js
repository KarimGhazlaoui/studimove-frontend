import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaPlus, FaMapMarkerAlt, FaUsers, FaHotel, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ VERSION DEBUG - Remplacez la fonction getEventStats par ceci :
  const getEventStats = async (eventId) => {
    try {
      console.log(`🔍 Récupération des stats pour événement: ${eventId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/assignments/event/${eventId}`);
      const data = await response.json();
      
      console.log(`📊 Réponse API assignments:`, data);
      
      if (data.success) {
        // ✅ Gestion de différents formats de données
        let assignments = [];
        
        if (Array.isArray(data.data)) {
          assignments = data.data;
          console.log(`✅ Format 1: data.data est un array de ${assignments.length} éléments`);
        } else if (data.data && Array.isArray(data.data.assignments)) {
          assignments = data.data.assignments;
          console.log(`✅ Format 2: data.data.assignments est un array de ${assignments.length} éléments`);
        } else if (data.data && Array.isArray(data.data.hotels)) {
          assignments = data.data.hotels;
          console.log(`✅ Format 3: data.data.hotels est un array de ${assignments.length} éléments`);
        } else {
          console.log(`❌ Format non reconnu:`, typeof data.data, data.data);
          return { totalHotels: 0, totalRooms: 0, totalCapacity: 0 };
        }
        
        console.log(`📋 Assignations trouvées:`, assignments);
        
        const stats = {
          totalHotels: assignments.length,
          totalRooms: assignments.reduce((sum, assignment) => {
            const roomCount = assignment.availableRooms?.reduce((roomSum, room) => 
              roomSum + (room.quantity || 0), 0) || 0;
            return sum + roomCount;
          }, 0),
          totalCapacity: assignments.reduce((sum, assignment) => {
            const capacity = assignment.availableRooms?.reduce((capSum, room) => 
              capSum + ((room.quantity || 0) * (room.bedCount || 0)), 0) || 0;
            return sum + capacity;
          }, 0)
        };
        
        console.log(`📈 Stats calculées:`, stats);
        return stats;
      } else {
        console.log(`❌ API retourné success: false`, data);
      }
    } catch (error) {
      console.error(`❌ Erreur stats événement ${eventId}:`, error);
    }
    
    return { totalHotels: 0, totalRooms: 0, totalCapacity: 0 };
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      const data = await response.json();
      
      if (data.success) {
        // ✅ Enrichir chaque événement avec ses vraies stats
        const eventsWithStats = await Promise.all(
          data.data.map(async (event) => {
            const stats = await getEventStats(event._id);
            return {
              ...event,
              // ✅ Remplacer par les vraies stats
              totalHotels: stats.totalHotels,
              totalRooms: stats.totalRooms,
              totalCapacity: stats.totalCapacity
            };
          })
        );
        
        setEvents(eventsWithStats);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Planification': { bg: 'warning', text: 'dark' },
      'Active': { bg: 'success', text: 'white' },
      'Terminé': { bg: 'secondary', text: 'white' },
      'Annulé': { bg: 'danger', text: 'white' }
    };
    return statusConfig[status] || { bg: 'secondary', text: 'white' };
  };

  const formatParticipants = (event) => {
    const current = event.currentParticipants || 0;
    const max = event.maxParticipants;
    
    if (max) {
      const percentage = current > 0 ? Math.round((current / max) * 100) : 0;
      return `${current} / ${max} (${percentage}%)`;
    }
    return current.toString();
  };

  const getParticipantsColor = (event) => {
    const current = event.currentParticipants || 0;
    const max = event.maxParticipants;
    
    if (!max) return 'text-primary';
    
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-danger';
    if (percentage >= 70) return 'text-warning';
    if (percentage >= 30) return 'text-info';
    return 'text-success';
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement des événements...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaCalendarAlt className="me-2 text-primary" />
                Gestion des Événements
              </h2>
              <p className="text-muted">Organisez vos événements StudiMove</p>
            </div>
            <Button as={Link} to="/events/new" variant="primary" size="lg">
              <FaPlus className="me-2" />
              Nouvel Événement
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        {events.map(event => (
          <Col key={event._id} lg={4} md={6} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0 text-primary">{event.name}</h5>
                <Badge {...getStatusBadge(event.status)}>
                  {event.status}
                </Badge>
              </Card.Header>
              
              <Card.Body className="d-flex flex-column">
                <div className="mb-3">
                  <p className="mb-2">
                    <FaMapMarkerAlt className="me-2 text-muted" />
                    <strong>{event.city}, {event.country}</strong>
                  </p>
                  
                  <p className="mb-2">
                    <strong>Du:</strong> {new Date(event.startDate).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                  
                  <p className="mb-2">
                    <strong>Au:</strong> {new Date(event.endDate).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* ✅ PARTICIPANTS */}
                <div className="mb-3">
                  <p className="mb-1">
                    <FaUsers className="me-2 text-muted" />
                    <strong>Participants:</strong>
                  </p>
                  <span className={`fs-6 fw-bold ${getParticipantsColor(event)}`}>
                    {formatParticipants(event)}
                  </span>
                </div>

                {/* ✅ HÔTELS CORRIGÉS */}
                <div className="mb-3">
                  <p className="mb-1">
                    <FaHotel className="me-2 text-muted" />
                    <strong>Hôtels:</strong> <span className="text-info">{event.totalHotels}</span>
                  </p>
                  {event.totalCapacity > 0 && (
                    <small className="text-muted">
                      {event.totalCapacity} places disponibles
                    </small>
                  )}
                </div>

                {/* ✅ DESCRIPTION */}
                {event.description && (
                  <div className="mb-3">
                    <small className="text-muted" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {event.description}
                    </small>
                  </div>
                )}

                <div className="mt-auto">
                  <div className="d-flex flex-column gap-2">
                    {/* Première ligne de boutons */}
                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/events/${event._id}/edit`}
                        variant="outline-primary"
                        size="sm"
                        className="flex-fill"
                      >
                        <FaEdit className="me-1" />
                        Modifier
                      </Button>
                      
                      <Button
                        as={Link}
                        to={`/events/${event._id}/hotels`}
                        variant="outline-success"
                        size="sm"
                        className="flex-fill"
                      >
                        <FaHotel className="me-1" />
                        Hôtels
                      </Button>
                    </div>

                    {/* Deuxième ligne */}
                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/clients?eventId=${event._id}`}
                        variant="outline-info"
                        size="sm"
                        className="flex-fill"
                      >
                        <FaUsers className="me-1" />
                        Clients
                      </Button>

                      <Button
                        as={Link}
                        to={`/assignments/${event._id}`}
                        variant="outline-warning"
                        size="sm"
                        className="flex-fill"
                      >
                        🏨 Assignations
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {events.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <FaCalendarAlt size={64} className="text-muted mb-3" />
            <h4 className="text-muted">Aucun événement</h4>
            <p className="text-muted">Commencez par créer votre premier événement StudiMove</p>
            <Button as={Link} to="/events/new" variant="primary" size="lg">
              <FaPlus className="me-2" />
              Créer votre premier événement
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default EventList;
