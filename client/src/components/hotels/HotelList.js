import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FaHotel, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const HotelList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hotels');
      const data = await response.json();
      
      if (data.success) {
        setHotels(data.data || []);
      } else {
        setError(data.message || 'Erreur lors du chargement des hôtels');
      }
    } catch (error) {
      console.error('Erreur fetch hotels:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet hôtel ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Hôtel supprimé avec succès');
        fetchHotels(); // Recharger la liste
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur de connexion');
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

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaHotel className="me-2" />
          Liste des Hôtels
        </h2>
        <Link to="/hotels/add" className="btn btn-primary">
          <FaPlus className="me-2" />
          Ajouter un Hôtel
        </Link>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {hotels.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaHotel size={48} className="mb-3" />
          <h5>Aucun hôtel trouvé</h5>
          <p>Commencez par ajouter votre premier hôtel.</p>
          <Link to="/hotels/add" className="btn btn-primary">
            <FaPlus className="me-2" />
            Ajouter un Hôtel
          </Link>
        </Alert>
      ) : (
        <Row>
          {hotels.map((hotel) => (
            <Col key={hotel._id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex align-items-center">
                    <FaHotel className="me-2 text-primary" />
                    {hotel.name}
                  </Card.Title>
                  
                  <Card.Text className="text-muted mb-2">
                    <strong>Adresse:</strong><br />
                    {hotel.address}
                  </Card.Text>

                  <Card.Text>
                    <strong>Contact:</strong><br />
                    📞 {hotel.phone}<br />
                    ✉️ {hotel.email}
                  </Card.Text>

                  {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                    <div className="mb-3">
                      <strong>Types de chambres:</strong>
                      <ul className="mb-0 mt-1">
                        {hotel.roomTypes.map((roomType, index) => (
                          <li key={index}>
                            {roomType.type} - {roomType.quantity} chambres 
                            (Capacité: {roomType.capacity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-muted small">
                    Créé le: {new Date(hotel.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </Card.Body>

                <Card.Footer className="bg-transparent">
                  <div className="btn-group w-100">
                    <Link 
                      to={`/hotels/${hotel._id}`} 
                      className="btn btn-outline-primary"
                      title="Voir les détails"
                    >
                      <FaEye />
                    </Link>
                    <Link 
                      to={`/hotels/edit/${hotel._id}`} 
                      className="btn btn-outline-warning"
                      title="Modifier"
                    >
                      <FaEdit />
                    </Link>
                    <Button 
                      variant="outline-danger"
                      onClick={() => handleDelete(hotel._id)}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default HotelList;