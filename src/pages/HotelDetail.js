import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { hotelService } from '../services/api';
import { toast } from 'react-toastify';

const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      const data = await hotelService.getHotelById(id);
      if (data.success) {
        setHotel(data.data);
      } else {
        toast.error('Hôtel non trouvé');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!hotel) {
    return (
      <Container className="text-center py-5">
        <h4>Hôtel non trouvé</h4>
        <Link to="/hotels" className="btn btn-primary">Retour à la liste</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{hotel.name}</h1>
        <div>
          <Link to="/hotels" className="btn btn-outline-secondary me-2">
            <FaArrowLeft className="me-1" />
            Retour
          </Link>
          <Link to={`/hotels/${hotel._id}/edit`} className="btn btn-primary">
            <FaEdit className="me-1" />
            Modifier
          </Link>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Informations générales</h5>
              <p><strong>Catégorie:</strong> {hotel.category || 'Non spécifiée'}</p>
              <p><strong>Description:</strong> {hotel.description || 'Aucune description'}</p>
              <p>
                <FaMapMarkerAlt className="me-1" />
                <strong>Adresse:</strong> {hotel.address}
              </p>
              <p><strong>Ville:</strong> {hotel.location}</p>
              <p><strong>Pays:</strong> {hotel.country}</p>
            </Card.Body>
          </Card>

          {hotel.amenities && hotel.amenities.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5>Équipements</h5>
                <div>
                  {hotel.amenities.map((amenity, index) => (
                    <Badge key={index} bg="light" text="dark" className="me-2 mb-2">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <h5>Détails</h5>
              {hotel.rating && (
                <p>
                  <FaStar className="text-warning me-1" />
                  <strong>Note:</strong> {hotel.rating}/5
                </p>
              )}
              {hotel.pricePerNight && (
                <p><strong>Prix/nuit:</strong> {hotel.pricePerNight}€</p>
              )}
              {hotel.phone && (
                <p><strong>Téléphone:</strong> {hotel.phone}</p>
              )}
              {hotel.email && (
                <p><strong>Email:</strong> {hotel.email}</p>
              )}
              {hotel.website && (
                <p><strong>Site web:</strong> 
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                    {hotel.website}
                  </a>
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HotelDetail;