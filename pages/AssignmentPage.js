import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Nav, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  FaUsers, 
  FaHotel, 
  FaRobot, 
  FaHandPaper, 
  FaChartBar, 
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle 
} from 'react-icons/fa';

// Composants
import ClientsList from '../components/assignments/ClientsList';
import HotelRoomsList from '../components/assignments/HotelRoomsList';
import AssignmentStats from '../components/assignments/AssignmentStats';
import AutoAssignmentModal from '../components/assignments/AutoAssignmentModal';
import ManualAssignmentModal from '../components/assignments/ManualAssignmentModal';
import OnSiteManagement from '../components/assignments/OnSiteManagement';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AssignmentPage = () => {
  const { eventId } = useParams();
  
  // États principaux
  const [event, setEvent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // États pour les modals
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [showManualAssignModal, setShowManualAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [autoAssigning, setAutoAssigning] = useState(false);

  // États pour les filtres
  const [filters, setFilters] = useState({
    clientType: 'all',
    gender: 'all',
    assignmentStatus: 'all',
    hotel: 'all'
  });

  // Charger les données
  useEffect(() => {
    loadAssignmentData();
  }, [eventId]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      
      // Charger en parallèle
      const [assignmentsRes, clientsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/assignments/event/${eventId}`),
        axios.get(`${API_URL}/clients?eventId=${eventId}`),
        axios.get(`${API_URL}/assignments/stats/${eventId}`)
      ]);

      setEvent(assignmentsRes.data.data.event);
      setAssignments(assignmentsRes.data.data.assignments);
      setClients(clientsRes.data.data);
      setStats(statsRes.data.data);
      
      console.log('📊 Données chargées:', {
        assignments: assignmentsRes.data.data.assignments.length,
        clients: clientsRes.data.data.length,
        stats: statsRes.data.data
      });

    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Assignation automatique
  const handleAutoAssignment = async (options) => {
    try {
      setAutoAssigning(true);
      
      const response = await axios.post(`${API_URL}/assignments/auto-assign/${eventId}`, {
        preserveManual: options.preserveManual,
        forceReassign: options.forceReassign
      });

      toast.success(response.data.message);
      
      // Recharger les données
      await loadAssignmentData();
      
      setShowAutoAssignModal(false);
      
    } catch (error) {
      console.error('❌ Erreur assignation auto:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation automatique');
    } finally {
      setAutoAssigning(false);
    }
  };

  // Assignation manuelle
  const handleManualAssignment = async (assignmentData) => {
    try {
      const response = await axios.post(`${API_URL}/assignments/manual-assign`, {
        clientId: assignmentData.clientId,
        hotelId: assignmentData.hotelId,
        eventId: eventId,
        logicalRoomId: assignmentData.logicalRoomId,
        forceAssign: assignmentData.forceAssign
      });

      toast.success(response.data.message);
      
      // Recharger les données
      await loadAssignmentData();
      
      setShowManualAssignModal(false);
      setSelectedClient(null);
      
    } catch (error) {
      console.error('❌ Erreur assignation manuelle:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation manuelle');
    }
  };

  // Retirer une assignation
  const handleRemoveAssignment = async (clientId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cette assignation ?')) return;
    
    try {
      await axios.delete(`${API_URL}/assignments/remove-client`, {
        data: { clientId, eventId }
      });

      toast.success('Assignation supprimée avec succès');
      await loadAssignmentData();
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Erreur lors de la suppression de l\'assignation');
    }
  };

  // Filtrer les clients
  const filteredClients = clients.filter(client => {
    if (filters.clientType !== 'all' && client.clientType !== filters.clientType) return false;
    if (filters.gender !== 'all' && client.gender !== filters.gender) return false;
    if (filters.assignmentStatus === 'assigned' && !client.assignment?.hotelId) return false;
    if (filters.assignmentStatus === 'unassigned' && client.assignment?.hotelId) return false;
    if (filters.hotel !== 'all' && client.assignment?.hotelId !== filters.hotel) return false;
    return true;
  });

  // Statistiques rapides
  const quickStats = {
    totalClients: clients.length,
    assignedClients: clients.filter(c => c.assignment?.hotelId).length,
    unassignedClients: clients.filter(c => !c.assignment?.hotelId).length,
    totalHotels: assignments.length,
    totalRooms: assignments.reduce((sum, a) => sum + a.logicalRooms.length, 0)
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des assignations...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* 📋 HEADER */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <FaMapMarkerAlt className="me-2 text-primary" />
                Assignations - {event?.name}
              </h2>
              <p className="text-muted mb-0">
                {event?.city}, {event?.country}
              </p>
            </div>
            
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={() => setShowAutoAssignModal(true)}
                disabled={autoAssigning}
              >
                <FaRobot className="me-1" />
                {autoAssigning ? 'Assignation...' : 'Auto-Assignation'}
              </Button>
              
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedClient(null);
                  setShowManualAssignModal(true);
                }}
              >
                <FaHandPaper className="me-1" />
                Assignation Manuelle
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* 📊 STATISTIQUES RAPIDES */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h4 className="text-primary">{quickStats.totalClients}</h4>
              <small className="text-muted">Clients Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-success">
            <Card.Body>
              <h4 className="text-success">{quickStats.assignedClients}</h4>
              <small className="text-muted">Assignés</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h4 className="text-warning">{quickStats.unassignedClients}</h4>
              <small className="text-muted">Non Assignés</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-info">
            <Card.Body>
              <h4 className="text-info">{quickStats.totalHotels}</h4>
              <small className="text-muted">Hôtels</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-secondary">
            <Card.Body>
              <h4 className="text-secondary">{quickStats.totalRooms}</h4>
              <small className="text-muted">Chambres</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-dark">
            <Card.Body>
              <h4 className="text-dark">
                {quickStats.totalClients > 0 ? 
                  Math.round((quickStats.assignedClients / quickStats.totalClients) * 100) : 0}%
              </h4>
              <small className="text-muted">Taux</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🚨 ALERTES */}
      {quickStats.unassignedClients > 0 && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>{quickStats.unassignedClients} clients</strong> ne sont pas encore assignés à une chambre.
        </Alert>
      )}

      {/* 📑 ONGLETS PRINCIPAUX */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="overview">
              <FaUsers className="me-1" />
              Vue d'ensemble
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="hotels">
              <FaHotel className="me-1" />
              Par Hôtels
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="stats">
              <FaChartBar className="me-1" />
              Statistiques
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="onsite">
              <FaCheckCircle className="me-1" />
              Gestion Sur Place
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* VUE D'ENSEMBLE */}
          <Tab.Pane eventKey="overview">
            <ClientsList
              clients={filteredClients}
              assignments={assignments}
              filters={filters}
              onFiltersChange={setFilters}
              onManualAssign={(client) => {
                setSelectedClient(client);
                setShowManualAssignModal(true);
              }}
              onRemoveAssignment={handleRemoveAssignment}
            />
          </Tab.Pane>

          {/* PAR HÔTELS */}
          <Tab.Pane eventKey="hotels">
            <HotelRoomsList
              assignments={assignments}
              onManualAssign={(client) => {
                setSelectedClient(client);
                setShowManualAssignModal(true);
              }}
              onRemoveAssignment={handleRemoveAssignment}
              onRoomUpdate={loadAssignmentData}
            />
          </Tab.Pane>

          {/* STATISTIQUES */}
          <Tab.Pane eventKey="stats">
            <AssignmentStats
              stats={stats}
              assignments={assignments}
              clients={clients}
            />
          </Tab.Pane>

          {/* GESTION SUR PLACE */}
          <Tab.Pane eventKey="onsite">
            <OnSiteManagement
              assignments={assignments}
              eventId={eventId}
              onUpdate={loadAssignmentData}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* 🤖 MODAL ASSIGNATION AUTOMATIQUE */}
      <AutoAssignmentModal
        show={showAutoAssignModal}
        onHide={() => setShowAutoAssignModal(false)}
        onConfirm={handleAutoAssignment}
        loading={autoAssigning}
        stats={quickStats}
      />

      {/* ✋ MODAL ASSIGNATION MANUELLE */}
      <ManualAssignmentModal
        show={showManualAssignModal}
        onHide={() => {
          setShowManualAssignModal(false);
          setSelectedClient(null);
        }}
        onConfirm={handleManualAssignment}
        selectedClient={selectedClient}
        assignments={assignments}
        clients={clients.filter(c => !c.assignment?.hotelId)} // Clients non assignés
        eventId={eventId}
      />
    </Container>
  );
};

export default AssignmentPage;
