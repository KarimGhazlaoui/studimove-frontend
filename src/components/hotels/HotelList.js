import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHotel, FaPlus, FaSearch, FaStar, FaMapMarkerAlt, FaEye, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    filterHotels();
  }, [hotels, searchTerm, cityFilter]);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      const data = await response.json();
      
      if (data.success) {
        setHotels(data.data);
      } else {
        toast.error('Erreur lors du chargement des hôtels');
      }
    } catch (error) {
      console.error('Erreur fetch hotels:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const filterHotels = () => {
    let filtered = hotels;

    if (searchTerm) {
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cityFilter !== 'all') {
      filtered = filtered.filter(hotel => 
        hotel.address.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    setFilteredHotels(filtered);
  };

  const getCities = () => {
    const cities = [...new Set(hotels.map(hotel => 
      hotel.address.split(',').pop().trim()
    ))];
    return cities.filter(city => city);
  };

  const getTotalRooms = (hotel) => {
    return hotel.roomTypes?.reduce((total, room) => total + room.quantity, 0) || 0;
  };

  const getRating = (hotel) => {
    if (!hotel.reviews || hotel.reviews.length === 0) return 0;
    const sum = hotel.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / hotel.reviews.length).toFixed(1);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaHotel className="me-2" />
                Gestion des Hôtels
              </h2>
              <p className="text-muted">Gérez votre réseau d'hôtels partenaires</p>
            </div>
            <Button as={Link} to="/hotels/new" variant="primary" size="lg">
              <FaPlus className="me-2" />
              Ajouter un Hôtel
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
              placeholder="Rechercher un hôtel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="all">Toutes les villes</option>
            {getCities().map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <div className="text-end">
            <small className="text-muted">
              {filteredHotels.length} hôtel(s) trouvé(s)
            </small>
          </div>
        </Col>
      </Row>

      {/* Liste des hôtels */}
      <Row>
        {filteredHotels.map(hotel => (
          <Col key={hotel._id} lg={4} md={6} className="mb-4">
            <Card className="h-100 hotel-card">
              {hotel.images && hotel.images.length > 0 && (
                <Card.Img 
                  variant="top" 
                  src={hotel.images[0]} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-start">
                  <span>{hotel.name}</span>
                  <div className="d-flex align-items-center">
                    <FaStar className="text-warning me-1" size={14} />
                    <small>{getRating(hotel)}</small>
                  </div>
                </Card.Title>
                
                <Card.Text>
                  <small className="text-muted">
                    <FaMapMarkerAlt className="me-1" />
                    {hotel.address}
                  </small>
                </Card.Text>

                <div className="hotel-stats mb-3">
                  <Row className="text-center">
                    <Col>
                      <div className="stat-item">
                        <strong>{getTotalRooms(hotel)}</strong>
                        <br />
                        <small className="text-muted">Chambres</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="stat-item">
                        <strong>{hotel.roomTypes?.length || 0}</strong>
                        <br />
                        <small className="text-muted">Types</small>
                      </div>
                    </Col>
                    <Col>
                      <div className="stat-item">
                        <strong>{hotel.reviews?.length || 0}</strong>
                        <br />
                        <small className="text-muted">Avis</small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="amenities mb-3">
                    {hotel.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                        {amenity}
                      </Badge>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <Badge bg="secondary">+{hotel.amenities.length - 3}</Badge>
                    )}
                  </div>
                )}
              </Card.Body>

              <Card.Footer className="d-flex justify-content-between">
                <Button 
                  as={Link} 
                  to={`/hotels/${hotel._id}`}
                  variant="outline-primary" 
                  size="sm"
                >
                  <FaEye className="me-1" />
                  Voir
                </Button>
                <Button 
                  as={Link} 
                  to={`/hotels/${hotel._id}/edit`}
                  variant="outline-secondary" 
                  size="sm"
                >
                  <FaEdit className="me-1" />
                  Modifier
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredHotels.length === 0 && !loading && (
        <Row>
          <Col className="text-center py-5">
            <FaHotel size={64} className="text-muted mb-3" />
            <h4 className="text-muted">Aucun hôtel trouvé</h4>
            <p className="text-muted">Commencez par ajouter votre premier hôtel partenaire</p>
            <Button as={Link} to="/hotels/new" variant="primary">
              <FaPlus className="me-2" />
              Ajouter un hôtel
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default HotelList;
