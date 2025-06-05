import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHotel, FaPlus, FaMapMarkerAlt, FaStar, FaCalendarAlt, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../config/api';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ NOUVELLE APPROCHE : Récupérer d'abord tous les événements et leurs assignations
  const fetchData = async () => {
    try {
      // 1. Récupérer tous les hôtels
      const hotelsResponse = await fetch(`${API_BASE_URL}/hotels`);
      const hotelsData = await hotelsResponse.json();
      
      // 2. Récupérer tous les événements
      const eventsResponse = await fetch(`${API_BASE_URL}/events`);
      const eventsData = await eventsResponse.json();
      
      if (hotelsData.success && eventsData.success) {
        const allEvents = eventsData.data;
        setEvents(allEvents);
        
        // 3. Pour chaque hôtel, trouver ses assignations via les événements
        const hotelsWithEvents = await Promise.all(
          hotelsData.data.map(async (hotel) => {
            const linkedAssignments = [];
            
            // Parcourir tous les événements pour trouver les assignations de cet hôtel
            for (const event of allEvents) {
              try {
                const assignmentsResponse = await fetch(`${API_BASE_URL}/assignments/event/${event._id}`);
                const assignmentsData = await assignmentsResponse.json();
                
                if (assignmentsData.success && assignmentsData.data?.assignments) {
                  // Chercher si cet hôtel est assigné à cet événement
                  const hotelAssignments = assignmentsData.data.assignments.filter(
                    assignment => assignment.hotelId._id === hotel._id
                  );
                  
                  // Ajouter les assignations trouvées avec les infos de l'événement
                  hotelAssignments.forEach(assignment => {
                    linkedAssignments.push({
                      ...assignment,
                      eventName: event.name,
                      eventCity: event.city,
                      eventCountry: event.country,
                      eventDates: {
                        start: event.startDate,
                        end: event.endDate
                      }
                    });
                  });
                }
              } catch (error) {
                console.error(`Erreur assignations événement ${event._id}:`, error);
              }
            }
            
            console.log(`🏨 Hôtel ${hotel.name} - ${linkedAssignments.length} assignations trouvées:`, linkedAssignments);
            
            return {
              ...hotel,
              linkedEvents: linkedAssignments
            };
          })
        );
        
        setHotels(hotelsWithEvents);
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    } catch (error) {
      console.error('Erreur fetch data:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/${hotelToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Hôtel supprimé avec succès');
        setHotels(hotels.filter(h => h._id !== hotelToDelete._id));
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de connexion');
    } finally {
      setShowDeleteModal(false);
      setHotelToDelete(null);
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.address.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement des hôtels...</span>
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
                <FaHotel className="me-2 text-primary" />
                Gestion des Hôtels
              </h2>
              <p className="text-muted">Gérez votre catalogue d'hôtels StudiMove</p>
            </div>
            <Button as={Link} to="/hotels/new" variant="primary" size="lg">
              <FaPlus className="me-2" />
              Nouvel Hôtel
            </Button>
          </div>
        </Col>
      </Row>

      {/* Barre de recherche */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Rechercher par nom, ville ou pays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      <Row>
        {filteredHotels.map(hotel => (
          <Col key={hotel._id} lg={4} md={6} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0 text-primary">{hotel.name}</h5>
                <div className="d-flex align-items-center">
                  {hotel.rating > 0 && (
                    <div className="me-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < hotel.rating ? 'text-warning' : 'text-muted'}
                          size="0.8em"
                        />
                      ))}
                      <small className="ms-1 text-muted">({hotel.rating})</small>
                    </div>
                  )}
                </div>
              </Card.Header>
              
              <Card.Body className="d-flex flex-column">
                <div className="mb-3">
                  <p className="mb-2">
                    <FaMapMarkerAlt className="me-2 text-muted" />
                    <strong>{hotel.address?.city || 'Ville'}, {hotel.address?.country || 'Pays'}</strong>
                  </p>
                  <small className="text-muted">{hotel.address?.street || hotel.address?.address || 'Adresse'}</small>
                </div>

                {/* ✅ ÉVÉNEMENTS LIÉS CORRIGÉS */}
                <div className="mb-3">
                  <p className="mb-2">
                    <FaCalendarAlt className="me-2 text-muted" />
                    <strong>Événements liés:</strong>
                  </p>
                  
                  {hotel.linkedEvents && hotel.linkedEvents.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {hotel.linkedEvents.slice(0, 2).map((assignment, index) => (
                        <Badge 
                          key={assignment._id || index} 
                          bg="success" 
                          className="text-wrap"
                          style={{ fontSize: '0.75em', maxWidth: '180px' }}
                          title={`${assignment.eventCity}, ${assignment.eventCountry}`}
                        >
                          {assignment.eventName}
                        </Badge>
                      ))}
                      {hotel.linkedEvents.length > 2 && (
                        <Badge bg="info" style={{ fontSize: '0.75em' }}>
                          +{hotel.linkedEvents.length - 2} autres
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <small className="text-muted fst-italic">Aucun événement assigné</small>
                  )}
                </div>

                {/* ✅ STATISTIQUES UTILES */}
                <div className="mb-3">
                  {hotel.linkedEvents && hotel.linkedEvents.length > 0 ? (
                    <div className="row text-center">
                      <div className="col-4">
                        <strong className="text-success">{hotel.linkedEvents.length}</strong>
                        <br />
                        <small className="text-muted">Événement{hotel.linkedEvents.length > 1 ? 's' : ''}</small>
                      </div>
                      <div className="col-4">
                        <strong className="text-info">
                          {hotel.linkedEvents.reduce((sum, assignment) => sum + (assignment.totalCapacity || 0), 0)}
                        </strong>
                        <br />
                        <small className="text-muted">Places</small>
                      </div>
                      <div className="col-4">
                        <strong className="text-warning">
                          {hotel.linkedEvents.reduce((sum, assignment) => {
                            const rooms = assignment.availableRooms?.reduce((roomSum, room) => 
                              roomSum + (room.quantity || 0), 0) || 0;
                            return sum + rooms;
                          }, 0)}
                        </strong>
                        <br />
                        <small className="text-muted">Chambres</small>
                      </div>
                    </div>
                  ) : (
                    <small className="text-muted">Aucune statistique disponible</small>
                  )}
                </div>

                {/* ✅ INFO SUPPLÉMENTAIRE DES CHAMBRES */}
                {hotel.linkedEvents && hotel.linkedEvents.length > 0 && hotel.linkedEvents[0].availableRooms && (
                  <div className="mb-3">
                    <small className="text-info">
                      Chambres de {hotel.linkedEvents[0].availableRooms[0]?.bedCount || 'N/A'} personnes max
                    </small>
                  </div>
                )}

                <div className="mt-auto">
                  <div className="d-flex gap-2">
                    <Button
                      as={Link}
                      to={`/hotels/${hotel._id}`}
                      variant="outline-info"
                      size="sm"
                      className="flex-fill"
                    >
                      <FaEye className="me-1" />
                      Voir
                    </Button>
                    
                    <Button
                      as={Link}
                      to={`/hotels/${hotel._id}/edit`}
                      variant="outline-primary"
                      size="sm"
                      className="flex-fill"
                    >
                      <FaEdit className="me-1" />
                      Modifier
                    </Button>
                    
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setHotelToDelete(hotel);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredHotels.length === 0 && !loading && (
        <Row>
          <Col className="text-center py-5">
            <FaHotel size={64} className="text-muted mb-3" />
            <h4 className="text-muted">
              {searchTerm ? 'Aucun hôtel trouvé' : 'Aucun hôtel'}
            </h4>
            <p className="text-muted">
              {searchTerm 
                ? 'Essayez de modifier votre recherche' 
                : 'Commencez par ajouter votre premier hôtel'
              }
            </p>
            {!searchTerm && (
              <Button as={Link} to="/hotels/new" variant="primary" size="lg">
                <FaPlus className="me-2" />
                Ajouter votre premier hôtel
              </Button>
            )}
          </Col>
        </Row>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {hotelToDelete && (
            <p>
              Êtes-vous sûr de vouloir supprimer l'hôtel <strong>"{hotelToDelete.name}"</strong> ?
              <br />
              <small className="text-danger">Cette action est irréversible.</small>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteHotel}>
            <FaTrash className="me-2" />
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HotelList;
