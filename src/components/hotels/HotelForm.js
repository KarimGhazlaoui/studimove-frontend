import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../../services/api';
import { toast } from 'react-toastify';

const HotelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    location: '',
    country: '',
    category: '',
    pricePerNight: '',
    rating: '',
    phone: '',
    email: '',
    website: '',
    amenities: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchHotel = useCallback(async () => {
    try {
      setLoading(true);
      const data = await hotelService.getHotelById(id);
      if (data.success) {
        const hotel = data.data;
        setFormData({
          name: hotel.name || '',
          description: hotel.description || '',
          // ✅ Récupérer depuis address
          address: hotel.address?.street || '',
          location: hotel.address?.city || '',
          country: hotel.address?.country || '',
          category: hotel.category || '', // Pas géré côté backend mais on garde
          pricePerNight: hotel.pricePerNight || '', // Pas géré côté backend mais on garde
          rating: hotel.rating || '',
          // ✅ Récupérer depuis contact
          phone: hotel.contact?.phone || '',
          email: hotel.contact?.email || '',
          website: hotel.contact?.website || '',
          // ✅ Convertir facilities en amenities
          amenities: hotel.facilities ? hotel.facilities.join(', ') : ''
        });
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'hôtel');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchHotel();
    }
  }, [isEdit, fetchHotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'La ville est requise';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Le pays est requis';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = 'La note doit être entre 0 et 5';
    }
    
    if (formData.pricePerNight && formData.pricePerNight < 0) {
      newErrors.pricePerNight = 'Le prix doit être positif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // ✅ ADAPTER LES DONNÉES AU FORMAT BACKEND
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        // ✅ Format address comme attendu par le backend
        address: {
          street: formData.address || '',
          city: formData.location || '',
          country: formData.country || '',
          zipCode: '', // Vous pouvez ajouter ce champ si nécessaire
          coordinates: {}
        },
        // ✅ Format contact comme attendu par le backend
        contact: {
          phone: formData.phone || '',
          email: formData.email || '',
          website: formData.website || ''
        },
        // ✅ Convertir amenities en facilities
        facilities: formData.amenities
          ? formData.amenities.split(',').map(item => item.trim()).filter(item => item)
          : [],
        rating: formData.rating ? parseFloat(formData.rating) : undefined
      };
      
      // Nettoyer les champs vides
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });
      
      console.log('🔍 Données adaptées pour le backend:', dataToSend);
      
      let result;
      if (isEdit) {
        result = await hotelService.updateHotel(id, dataToSend);
      } else {
        result = await hotelService.createHotel(dataToSend);
      }
      
      if (result.success) {
        toast.success(`Hôtel ${isEdit ? 'modifié' : 'créé'} avec succès`);
        navigate('/hotels');
      } else {
        toast.error(result.message || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEdit ? 'Modifier l\'hôtel' : 'Ajouter un hôtel'}</h1>
        <Link to="/hotels" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" />
          Retour
        </Link>
      </div>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Informations de base */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom de l'hôtel *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                        placeholder="Ex: Hôtel des Alpes"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Catégorie</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        <option value="Hotel">Hôtel</option>
                        <option value="Resort">Resort</option>
                        <option value="Residence">Résidence étudiante</option>
                        <option value="Auberge">Auberge de jeunesse</option>
                        <option value="Aparthotel">Aparthotel</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Localisation */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ville *</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        isInvalid={!!errors.location}
                        placeholder="Ex: Paris"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.location}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pays *</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        isInvalid={!!errors.country}
                        placeholder="Ex: France"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.country}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Adresse */}
                <Form.Group className="mb-3">
                  <Form.Label>Adresse complète</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                  />
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez l'hôtel, ses services, son ambiance..."
                  />
                </Form.Group>

                {/* Prix et note */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Prix par nuit (€)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="pricePerNight"
                        value={formData.pricePerNight}
                        onChange={handleChange}
                        isInvalid={!!errors.pricePerNight}
                        placeholder="Ex: 89.99"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.pricePerNight}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Note (0-5)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        isInvalid={!!errors.rating}
                        placeholder="Ex: 4.2"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.rating}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Informations de contact */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Téléphone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ex: +33 1 23 45 67 89"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        placeholder="Ex: contact@hotel.com"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Site web */}
                <Form.Group className="mb-3">
                  <Form.Label>Site web</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Ex: https://www.hotel.com"
                  />
                </Form.Group>

                {/* Équipements */}
                <Form.Group className="mb-4">
                  <Form.Label>Équipements</Form.Label>
                  <Form.Control
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="Ex: WiFi, Piscine, Climatisation, Parking (séparés par des virgules)"
                  />
                  <Form.Text className="text-muted">
                    Séparez les équipements par des virgules
                  </Form.Text>
                </Form.Group>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-between">
                  <Link to="/hotels" className="btn btn-secondary">
                    Annuler
                  </Link>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        {isEdit ? 'Modifier' : 'Créer'}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HotelForm;
