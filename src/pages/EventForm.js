import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaSave, FaArrowLeft } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://studimove-hotel.onrender.com';

const eventService = {
  getEventById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    return await response.json();
  },
  
  createEvent: async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return await response.json();
  },
  
  updateEvent: async (id, eventData) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return await response.json();
  }
};

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Planification',
    maxParticipants: '',
    allowMixedGroups: false,
    vipPrice: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Fonction pour convertir date ISO vers format input (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // ✅ Fonction pour afficher date en français
  const formatDateFrench = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Charger les données de l'événement si mode édition
  const fetchEvent = useCallback(async () => {
    if (!isEdit) return;
    
    try {
      setLoading(true);
      const data = await eventService.getEventById(id);
      if (data.success) {
        const event = data.data;
        setFormData({
          name: event.name || '',
          country: event.country || '',
          city: event.city || '',
          startDate: event.startDate ? formatDateForInput(event.startDate) : '',
          endDate: event.endDate ? formatDateForInput(event.endDate) : '',
          description: event.description || '',
          status: event.status || 'Planification',
          maxParticipants: event.maxParticipants || '',
          allowMixedGroups: event.allowMixedGroups || false,
          vipPrice: event.vipPrice || ''
        });
      } else {
        toast.error('Événement non trouvé');
        navigate('/events');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement de l\'événement');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'événement est requis';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Le pays est requis';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La date de fin est requise';
    }

    // Validation des dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate + 'T00:00:00');
      const end = new Date(formData.endDate + 'T00:00:00');
      
      if (start >= end) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }

    // Validation maxParticipants
    if (formData.maxParticipants && (isNaN(formData.maxParticipants) || parseInt(formData.maxParticipants) < 1)) {
      newErrors.maxParticipants = 'Le nombre de participants doit être un nombre positif';
    }

    // Validation vipPrice
    if (formData.vipPrice && (isNaN(formData.vipPrice) || parseFloat(formData.vipPrice) < 0)) {
      newErrors.vipPrice = 'Le prix VIP doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setLoading(true);

    try {
      // ✅ Validation supplémentaire des dates côté frontend
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate + 'T00:00:00');
        const end = new Date(formData.endDate + 'T23:59:59');
        
        console.log('🔍 Validation dates:');
        console.log('- Date début:', start.toLocaleDateString('fr-FR'));
        console.log('- Date fin:', end.toLocaleDateString('fr-FR'));
        
        if (start >= end) {
          toast.error('⚠️ La date de fin doit être après la date de début');
          setLoading(false);
          return;
        }
      }

      // ✅ Préparer les données avec le bon format
      const dataToSend = {
        name: formData.name.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        // ✅ Format ISO avec heures fixes pour éviter les problèmes de timezone
        startDate: formData.startDate ? `${formData.startDate}T00:00:00.000Z` : undefined,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59.000Z` : undefined,
        description: formData.description.trim(),
        status: formData.status,
        maxParticipants: formData.maxParticipants 
          ? parseInt(formData.maxParticipants) 
          : null,
        allowMixedGroups: Boolean(formData.allowMixedGroups),
        vipPrice: formData.vipPrice 
          ? parseFloat(formData.vipPrice) 
          : 0
      };

      // Nettoyer les valeurs undefined
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });

      console.log('🔍 Données envoyées:', dataToSend);

      const url = isEdit 
        ? `${API_BASE_URL}/events/${id}` 
        : `${API_BASE_URL}/events`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('🔍 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorJson.message || `Erreur ${response.status}`);
        } catch (parseError) {
          throw new Error(`Erreur serveur ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('🔍 Réponse serveur:', data);
      
      if (data.success) {
        toast.success(isEdit ? 'Événement modifié avec succès !' : 'Événement créé avec succès !');
        navigate('/events');
      } else {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white d-flex align-items-center">
              <FaCalendarAlt className="me-2" />
              <h4 className="mb-0">
                {isEdit ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h4>
            </Card.Header>
            
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Informations générales */}
                <h5 className="text-primary mb-3">
                  <FaMapMarkerAlt className="me-2" />
                  Informations générales
                </h5>
                
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom de l'événement *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                        placeholder="Ex: Festival de musique 2024"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
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
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.country}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ville *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        isInvalid={!!errors.city}
                        placeholder="Ex: Paris"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.city}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Dates */}
                <h5 className="text-primary mb-3 mt-4">
                  <FaCalendarAlt className="me-2" />
                  Dates de l'événement
                </h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date de début *</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        isInvalid={!!errors.startDate}
                        required
                      />
                      {formData.startDate && (
                        <Form.Text className="text-success">
                          📅 {formatDateFrench(formData.startDate)}
                        </Form.Text>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.startDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date de fin *</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        isInvalid={!!errors.endDate}
                        required
                      />
                      {formData.endDate && (
                        <Form.Text className="text-success">
                          📅 {formatDateFrench(formData.endDate)}
                        </Form.Text>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.endDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description de l'événement..."
                  />
                </Form.Group>

                {/* Paramètres avancés */}
                <h5 className="text-primary mb-3 mt-4">
                  Paramètres avancés
                </h5>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="Planification">📋 Planification</option>
                        <option value="Active">✅ Active</option>
                        <option value="Terminé">🏁 Terminé</option>
                        <option value="Annulé">❌ Annulé</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre maximum de participants</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        isInvalid={!!errors.maxParticipants}
                        min="1"
                        placeholder="Ex: 200"
                      />
                      <Form.Text className="text-muted">
                        Laissez vide pour aucune limite
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {errors.maxParticipants}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Prix VIP (€)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="vipPrice"
                        value={formData.vipPrice}
                        onChange={handleChange}
                        isInvalid={!!errors.vipPrice}
                        min="0"
                        placeholder="Ex: 150.00"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.vipPrice}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3 d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        name="allowMixedGroups"
                        checked={formData.allowMixedGroups}
                        onChange={handleChange}
                        label="Autoriser les groupes mixtes"
                        className="mt-4"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Aperçu des dates */}
                {formData.startDate && formData.endDate && (
                  <Alert variant="info" className="mt-3">
                    <h6>📅 Aperçu de l'événement :</h6>
                    <p className="mb-1">
                      <strong>Du :</strong> {formatDateFrench(formData.startDate)}
                    </p>
                    <p className="mb-1">
                      <strong>Au :</strong> {formatDateFrench(formData.endDate)}
                    </p>
                    <p className="mb-0">
                      <strong>Durée :</strong> {
                        Math.ceil((new Date(formData.endDate + 'T00:00:00') - new Date(formData.startDate + 'T00:00:00')) / (1000 * 60 * 60 * 24)) + 1
                      } jour(s)
                    </p>
                  </Alert>
                )}

                {/* Boutons d'action */}
                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/events')}
                    disabled={loading}
                  >
                    <FaArrowLeft className="me-2" />
                    Retour
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        {isEdit ? 'Modification...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        {isEdit ? 'Modifier l\'événement' : 'Créer l\'événement'}
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

export default EventForm;
