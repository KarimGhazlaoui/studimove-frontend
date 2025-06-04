import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaUser } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService } from '../../services/api';
import { toast } from 'react-toastify';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    type: 'Solo',
    groupName: '',
    groupSize: 1,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [existingGroups, setExistingGroups] = useState([]);

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      const response = await clientService.getClientById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du client');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchExistingGroups = useCallback(async () => {
    try {
      const response = await clientService.getGroups();
      setExistingGroups(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      fetchClient();
    }
    fetchExistingGroups();
  }, [isEditing, fetchClient, fetchExistingGroups]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'groupSize' ? parseInt(value) || 1 : value
    }));

    // Nettoyer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Ajuster automatiquement les champs selon le type
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value,
        groupSize: value === 'Solo' ? 1 : prev.groupSize,
        groupName: value === 'Solo' ? '' : prev.groupName
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^[+]?[\d\s\-()]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    if (formData.type === 'Groupe') {
      if (!formData.groupName.trim()) {
        newErrors.groupName = 'Le nom du groupe est requis pour un client de type Groupe';
      }
      if (formData.groupSize < 2) {
        newErrors.groupSize = 'Un groupe doit avoir au moins 2 personnes';
      }
    }

    if (formData.groupSize < 1 || formData.groupSize > 20) {
      newErrors.groupSize = 'La taille du groupe doit être entre 1 et 20';
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

    try {
      setLoading(true);

      if (isEditing) {
        await clientService.updateClient(id, formData);
        toast.success('Client modifié avec succès');
      } else {
        await clientService.createClient(formData);
        toast.success('Client créé avec succès');
      }

      navigate('/clients');
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error.message.includes('400')) {
        toast.error('Données invalides. Vérifiez le formulaire.');
      } else {
        toast.error(`Erreur lors de ${isEditing ? 'la modification' : 'la création'} du client`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FaUser className="me-2" />
                {isEditing ? 'Modifier le Client' : 'Nouveau Client'}
              </h4>
            </Card.Header>
            <Card.Body>
              {loading && !isEditing ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Prénom *</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          isInvalid={!!errors.firstName}
                          placeholder="Entrez le prénom"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom *</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          isInvalid={!!errors.lastName}
                          placeholder="Entrez le nom"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Téléphone *</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      isInvalid={!!errors.phone}
                      placeholder="Ex: +33 1 23 45 67 89"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Format: numéros, espaces, parenthèses et tirets acceptés
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Type *</Form.Label>
                        <Form.Select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                        >
                          <option value="Solo">Solo</option>
                          <option value="Groupe">Groupe</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Taille du groupe *
                          {formData.type === 'Solo' && (
                            <small className="text-muted ms-2">(Solo = 1 personne)</small>
                          )}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="groupSize"
                          value={formData.groupSize}
                          onChange={handleChange}
                          isInvalid={!!errors.groupSize}
                          min="1"
                          max="20"
                          disabled={formData.type === 'Solo'}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.groupSize}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {formData.type === 'Groupe' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Nom du groupe *</Form.Label>
                      <Form.Control
                        type="text"
                        name="groupName"
                        value={formData.groupName}
                        onChange={handleChange}
                        isInvalid={!!errors.groupName}
                        placeholder="Ex: Famille Dupont, Groupe 1, etc."
                        list="existing-groups"
                      />
                      <datalist id="existing-groups">
                        {existingGroups.map((group, index) => (
                          <option key={index} value={group._id} />
                        ))}
                      </datalist>
                      <Form.Control.Feedback type="invalid">
                        {errors.groupName}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Les clients avec le même nom de groupe seront automatiquement liés
                      </Form.Text>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Notes supplémentaires (optionnel)"
                      maxLength={500}
                    />
                    <Form.Text className="text-muted">
                      {formData.notes.length}/500 caractères
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/clients')}
                      disabled={loading}
                    >
                      <FaArrowLeft className="me-1" />
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          {isEditing ? 'Modification...' : 'Création...'}
                        </>
                      ) : (
                        <>
                          <FaSave className="me-1" />
                          {isEditing ? 'Modifier' : 'Créer'}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              {Object.keys(errors).length > 0 && (
                <Alert variant="danger" className="mt-3">
                  <strong>Erreurs dans le formulaire :</strong>
                  <ul className="mb-0 mt-2">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ClientForm;
