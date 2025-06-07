import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
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
              
              {/* 🔧 CORRECTION : Affichage correct de l'adresse */}
              <p>
                <FaMapMarkerAlt className="me-1" />
                <strong>Adresse:</strong> {hotel.address?.street}, {hotel.address?.city}
              </p>
              <p><strong>Ville:</strong> {hotel.address?.city || hotel.location}</p>
              <p><strong>Pays:</strong> {hotel.address?.country || hotel.country}</p>
              {hotel.address?.zipCode && (
                <p><strong>Code postal:</strong> {hotel.address.zipCode}</p>
              )}
            </Card.Body>
          </Card>

          {/* Équipements et installations */}
          {hotel.facilities && hotel.facilities.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5>Installations</h5>
                <div>
                  {hotel.facilities.map((facility, index) => (
                    <Badge key={index} bg="info" className="me-2 mb-2">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Types de chambres */}
          {hotel.roomTypes && hotel.roomTypes.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5>Types de chambres</h5>
                <div>
                  {hotel.roomTypes.map((room, index) => (
                    <Badge key={index} bg="success" className="me-2 mb-2">
                      {room.type || room.name} ({room.capacity || room.bedCount} places)
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

              {/* Contact */}
              {(hotel.phone || hotel.contact?.phone) && (
                <p><strong>Téléphone:</strong> {hotel.phone || hotel.contact.phone}</p>
              )}
              
              {(hotel.email || hotel.contact?.email) && (
                <p><strong>Email:</strong> {hotel.email || hotel.contact.email}</p>
              )}
              
              {(hotel.website || hotel.contact?.website) && (
                <p><strong>Site web:</strong>
                  <a href={hotel.website || hotel.contact.website} target="_blank" rel="noopener noreferrer" className="ms-1">
                    Visiter
                  </a>
                </p>
              )}

              {/* Statistiques */}
              <hr />
              <h6>Statistiques</h6>
              <p><strong>Chambres totales:</strong> {hotel.totalRooms || 0}</p>
              <p><strong>Capacité totale:</strong> {hotel.totalCapacity || 0} places</p>
              <p><strong>Clients assignés:</strong> {hotel.assignedClients || 0}</p>
              <p><strong>Statut:</strong> 
                <Badge bg={hotel.status === 'Active' ? 'success' : 'warning'} className="ms-1">
                  {hotel.status}
                </Badge>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HotelDetail;
