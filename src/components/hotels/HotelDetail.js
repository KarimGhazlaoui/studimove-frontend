import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { FaMapMarkerAlt, FaStar, FaEuroSign, FaPhone, FaEnvelope, FaGlobe, FaEdit, FaArrowLeft, FaTrash, FaHotel } from 'react-icons/fa';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../../services/api';
import { toast } from 'react-toastify';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHotel = useCallback(async () => {
    try {
      const data = await hotelService.getHotelById(id);
      if (data.success) {
        setHotel(data.data);
      } else {
        toast.error('Hôtel non trouvé');
        navigate('/hotels');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchHotel();
  }, [fetchHotel]);

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'hôtel "${hotel.name}" ?`)) {
      try {
        await hotelService.deleteHotel(id);
        toast.success('Hôtel supprimé avec succès');
        navigate('/hotels');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
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

  if (!hotel) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Hôtel non trouvé</h3>
          <Link to="/hotels" className="btn btn-primary">
            Retour à la liste
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* En-tête avec navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/hotels" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" />
          Retour à la liste
        </Link>
        <div>
          <Link to={`/hotels/edit/${hotel._id}`} className="btn btn-warning me-2">
            <FaEdit className="me-2" />
            Modifier
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="me-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <Row>
        {/* Image principale */}
        <Col lg={8}>
          <Card className="mb-4">
            {hotel.imageUrl ? (
              <Card.Img variant="top" src={hotel.imageUrl} className="hotel-image" />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center hotel-image">
                <FaHotel size={60} className="text-muted" />
              </div>
            )}
          </Card>
        </Col>

        {/* Informations principales */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h3 className="mb-0">{hotel.name}</h3>
              <div className="d-flex align-items-center mt-2">
                <FaMapMarkerAlt className="text-muted me-2" />
                <span className="text-muted">{hotel.location}, {hotel.country}</span>
              </div>
            </Card.Header>
            <Card.Body>
              {hotel.rating && (
                <div className="mb-3">
                  <Badge bg="warning" text="dark" className="fs-6">
                    <FaStar className="me-1" />
                    {hotel.rating}/5
                  </Badge>
                </div>
              )}

              {hotel.pricePerNight && (
                <div className="mb-3">
                  <h4 className="text-primary">
                    <FaEuroSign className="me-1" />
                    {hotel.pricePerNight}€
                  </h4>
                  <small className="text-muted">par nuit</small>
                </div>
              )}

              <div className="mb-3">
                <Badge bg="info">{hotel.category || 'Non spécifié'}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Description */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Description</h5>
            </Card.Header>
            <Card.Body>
              <p>{hotel.description || 'Aucune description disponible.'}</p>
            </Card.Body>
          </Card>

          {/* Équipements */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5>Équipements</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity, index) => (
                    <Badge key={index} bg="outline-primary" className="p-2">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Informations de contact */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Informations</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Adresse :</strong><br />
                {hotel.address || 'Non spécifiée'}
              </ListGroup.Item>
              
              {hotel.phone && (
                <ListGroup.Item>
                  <FaPhone className="text-primary me-2" />
                  <a href={`tel:${hotel.phone}`} className="text-decoration-none">
                    {hotel.phone}
                  </a>
                </ListGroup.Item>
              )}
              
              {hotel.email && (
                <ListGroup.Item>
                  <FaEnvelope className="text-primary me-2" />
                  <a href={`mailto:${hotel.email}`} className="text-decoration-none">
                    {hotel.email}
                  </a>
                </ListGroup.Item>
              )}
              
              {hotel.website && (
                <ListGroup.Item>
                  <FaGlobe className="text-primary me-2" />
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    Site web
                  </a>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item>
                <small className="text-muted">
                  Créé le {new Date(hotel.createdAt).toLocaleDateString('fr-FR')}
                </small>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HotelDetail;
