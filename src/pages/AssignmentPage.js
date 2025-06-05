import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';

// Contexts
import { AssignmentProvider } from '../contexts/AssignmentContext';

// Components
import AssignmentHeader from '../components/assignments/AssignmentHeader';
import HotelPanel from '../components/assignments/HotelPanel';
import ClientPanel from '../components/assignments/ClientPanel';
import AssignmentPanel from '../components/assignments/AssignmentPanel';
import StatsPanel from '../components/assignments/StatsPanel';
import ValidationPanel from '../components/assignments/ValidationPanel';
import NotificationPanel from '../components/assignments/NotificationPanel';
import FiltersPanel from '../components/assignments/FiltersPanel';
import HistoryPanel from '../components/assignments/HistoryPanel';

// Services
import eventService from '../services/eventService';
import clientService from '../services/clientService';
import hotelService from '../services/hotelService';
import assignmentService from '../services/assignmentService';

const AssignmentPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [clients, setClients] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('assignment');

  // Chargement initial des données
  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les données en parallèle
      const [
        eventResponse,
        clientsResponse,
        hotelsResponse,
        assignmentsResponse
      ] = await Promise.all([
        eventService.getEvent(eventId),
        clientService.getClients({ eventId }),
        hotelService.getHotels({ eventId }),
        assignmentService.getAssignments(eventId)
      ]);

      setEvent(eventResponse.data);
      setClients(clientsResponse.data);
      setHotels(hotelsResponse.data);
      setAssignments(assignmentsResponse.data || []);

      toast.success('Données chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Impossible de charger les données de l\'événement');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDataRefresh = async () => {
    await loadEventData();
  };

  const handleAssignmentUpdate = (newAssignments) => {
    setAssignments(newAssignments);
  };

  const handleClientUpdate = (updatedClients) => {
    setClients(updatedClients);
  };

  const handleHotelUpdate = (updatedHotels) => {
    setHotels(updatedHotels);
  };

  // Gestion des erreurs
  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <div className="mt-2">Chargement des données...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-danger" onClick={loadEventData}>
              Réessayer
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/events')}>
              Retour aux événements
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Événement non trouvé</Alert.Heading>
          <p>L'événement demandé n'existe pas ou n'est plus disponible.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/events')}>
            Retour aux événements
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <AssignmentProvider
      eventId={eventId}
      initialClients={clients}
      initialHotels={hotels}
      initialAssignments={assignments}
    >
      <Container fluid className="py-3">
        {/* En-tête */}
        <AssignmentHeader 
          event={event}
          onRefresh={handleDataRefresh}
          onBack={() => navigate('/events')}
        />

        {/* Interface principale avec onglets */}
        <Tabs
          activeKey={activeTab}
          onSelect={(tab) => setActiveTab(tab)}
          className="mb-3"
        >
          {/* Onglet principal - Assignation */}
          <Tab eventKey="assignment" title={
            <span>
              <i className="fas fa-tasks me-2"></i>
              Assignation
            </span>
          }>
            <Row className="g-3">
              {/* Colonne gauche - Clients et filtres */}
              <Col lg={4}>
                <div className="d-flex flex-column gap-3">
                  <FiltersPanel 
                    clients={clients}
                    hotels={hotels}
                    onFiltersChange={(filters) => {
                      // Les filtres sont gérés par le contexte
                    }}
                  />
                  <ClientPanel 
                    onClientUpdate={handleClientUpdate}
                  />
                </div>
              </Col>

              {/* Colonne centrale - Hôtels et assignation */}
              <Col lg={5}>
                <div className="d-flex flex-column gap-3">
                  <HotelPanel 
                    onHotelUpdate={handleHotelUpdate}
                  />
                  <AssignmentPanel 
                    onAssignmentUpdate={handleAssignmentUpdate}
                  />
                </div>
              </Col>

              {/* Colonne droite - Stats et validation */}
              <Col lg={3}>
                <div className="d-flex flex-column gap-3">
                  <StatsPanel />
                  <ValidationPanel 
                    clients={clients}
                    hotels={hotels}
                    assignments={assignments}
                  />
                  <NotificationPanel />
                </div>
              </Col>
            </Row>
          </Tab>

          {/* Onglet Historique */}
          <Tab eventKey="history" title={
            <span>
              <i className="fas fa-history me-2"></i>
              Historique
            </span>
          }>
            <Row>
              <Col lg={8}>
                <HistoryPanel />
              </Col>
              <Col lg={4}>
                <div className="d-flex flex-column gap-3">
                  <StatsPanel />
                  <NotificationPanel />
                </div>
              </Col>
            </Row>
          </Tab>

          {/* Onglet Vue d'ensemble */}
          <Tab eventKey="overview" title={
            <span>
              <i className="fas fa-chart-bar me-2"></i>
              Vue d'ensemble
            </span>
          }>
            <Row className="g-3">
              <Col lg={6}>
                <StatsPanel expanded={true} />
              </Col>
              <Col lg={6}>
                <ValidationPanel 
                  clients={clients}
                  hotels={hotels}
                  assignments={assignments}
                />
              </Col>
              <Col lg={12}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-users me-2"></i>
                          Répartition par type de client
                        </h6>
                      </div>
                      <div className="card-body">
                        {/* Graphique ou tableau de répartition */}
                        <div className="text-center text-muted py-4">
                          <i className="fas fa-chart-pie fa-2x mb-2"></i>
                          <div>Graphique à implémenter</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-hotel me-2"></i>
                          Occupation des hôtels
                        </h6>
                      </div>
                      <div className="card-body">
                        {/* Graphique ou tableau d'occupation */}
                        <div className="text-center text-muted py-4">
                          <i className="fas fa-chart-bar fa-2x mb-2"></i>
                          <div>Graphique à implémenter</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Tab>

          {/* Onglet Export */}
          <Tab eventKey="export" title={
            <span>
              <i className="fas fa-download me-2"></i>
              Export
            </span>
          }>
            <Row>
              <Col lg={8}>
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="fas fa-file-export me-2"></i>
                      Options d'export
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-body text-center">
                            <i className="fas fa-file-excel fa-2x text-success mb-3"></i>
                            <h6>Export Excel</h6>
                            <p className="text-muted small">
                              Liste complète des assignations avec détails
                            </p>
                            <button className="btn btn-success">
                              <i className="fas fa-download me-1"></i>
                              Télécharger Excel
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-body text-center">
                            <i className="fas fa-file-pdf fa-2x text-danger mb-3"></i>
                            <h6>Export PDF</h6>
                            <p className="text-muted small">
                              Rapport formaté pour impression
                            </p>
                            <button className="btn btn-danger">
                              <i className="fas fa-download me-1"></i>
                              Télécharger PDF
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-body text-center">
                            <i className="fas fa-envelope fa-2x text-primary mb-3"></i>
                            <h6>Envoi par email</h6>
                            <p className="text-muted small">
                              Envoyer les assignations par email
                            </p>
                            <button className="btn btn-primary">
                              <i className="fas fa-paper-plane me-1"></i>
                              Configurer envoi
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-body text-center">
                            <i className="fas fa-print fa-2x text-dark mb-3"></i>
                            <h6>Impression</h6>
                            <p className="text-muted small">
                              Impression directe des listes
                            </p>
                            <button className="btn btn-dark">
                              <i className="fas fa-print me-1"></i>
                              Imprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="d-flex flex-column gap-3">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Informations</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Clients total:</span>
                        <strong>{clients.length}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Assignés:</span>
                        <strong className="text-success">
                          {clients.filter(c => assignments.some(a => 
                            a.logicalRooms.some(r => 
                              r.assignedClients.some(ac => ac.clientId._id === c._id)
                            )
                          )).length}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>En attente:</span>
                        <strong className="text-warning">
                          {clients.filter(c => !assignments.some(a => 
                            a.logicalRooms.some(r => 
                              r.assignedClients.some(ac => ac.clientId._id === c._id)
                            )
                          )).length}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Hôtels:</span>
                        <strong>{hotels.length}</strong>
                      </div>
                    </div>
                  </div>
                  <NotificationPanel />
                </div>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </AssignmentProvider>
  );
};

export default AssignmentPage;
