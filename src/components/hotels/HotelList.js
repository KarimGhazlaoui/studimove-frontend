import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal } from 'react-bootstrap';
import { FaMapMarkerAlt, FaStar, FaEuroSign, FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { hotelService } from '../../services/api';
import { toast } from 'react-toastify';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const data = await hotelService.getAllHotels();
      if (data.success) {
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des hôtels');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (hotel) => {
    setHotelToDelete(hotel);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await hotelService.deleteHotel(hotelToDelete._id);
      toast.success('Hôtel supprimé avec succès');
      fetchHotels(); // Recharger la liste
      setShowDeleteModal(false);
      setHotelToDelete(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Hôtels ({hotels.length})</h1>
        <Link to="/hotels/add" className="btn btn-primary">
          <FaPlus className="me-2" />
          Ajouter un hôtel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-5">
          <h3>Aucun hôtel trouvé</h3>
          <p className="text-muted">Commencez par ajouter votre premier hôtel.</p>
          <Link to="/hotels/add" className="btn btn-primary">
            <FaPlus className="me-2" />
            Ajouter un hôtel
          </Link>
        </div>
      ) : (
        <Row>
          {hotels.map((hotel) => (
            <Col md={6} lg={4} key={hotel._id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-start">
                    <span>{hotel.name}</span>
                    <div className="dropdown">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="dropdown-toggle"
                        data-bs-toggle="dropdown"
                      >
                        ⋮
                      </Button>
                      <ul className="dropdown-menu">
                        <li>
                          <Link 
                            to={`/hotels/${hotel._id}`} 
                            className="dropdown-item"
                          >
                            <FaEye className="me-2" />
                            Voir détails
                          </Link>
                        </li>
                        <li>
                          <Link 
                            to={`/hotels/edit/${hotel._id}`} 
                            className="dropdown-item"
                          >
                            <FaEdit className="me-2" />
                            Modifier
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item text-danger"
                            onClick={() => handleDeleteClick(hotel)}
                          >
                            <FaTrash className="me-2" />
                            Supprimer
                          </button>
                        </li>
                      </ul>
                    </div>
                  </Card.Title>
                  
                  <Card.Text>
                    <small className="text-muted">
                      <FaMapMarkerAlt className="me-1" />
                      {hotel.location || hotel.city}, {hotel.country}
                    </small>
                  </Card.Text>
                  <Card.Text>{hotel.description}</Card.Text>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      {hotel.rating && (
                        <Badge bg="warning" text="dark">
                          <FaStar className="me-1" />
                          {hotel.rating}
                        </Badge>
                      )}
                    </div>
                    {hotel.pricePerNight && (
                      <div>
                        <strong>
                          <FaEuroSign className="me-1" />
                          {hotel.pricePerNight}€/nuit
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <Link 
                      to={`/hotels/${hotel._id}`} 
                      className="btn btn-outline-primary btn-sm"
                    >
                      <FaEye className="me-2" />
                      Voir détails
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer l'hôtel <strong>{hotelToDelete?.name}</strong> ?
          <br />
          <small className="text-muted">Cette action est irréversible.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <FaTrash className="me-2" />
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HotelList;
