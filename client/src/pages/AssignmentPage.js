const AssignmentPage = () => {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, hotelsRes] = await Promise.all([
        fetch(`/api/clients?eventId=${eventId}`),
        fetch(`/api/hotels?eventId=${eventId}`)
      ]);
      
      const clientsData = await clientsRes.json();
      const hotelsData = await hotelsRes.json();
      
      setClients(clientsData.data || []);
      setHotels(hotelsData.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="assignment-page">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <FaBed className="me-2" />
              Assignation des chambres
            </h2>
            <p className="text-muted">
              Gestion automatique et manuelle des assignations de chambres
            </p>
          </div>
          
          <div className="page-actions">
            <button className="btn btn-outline-primary me-2" onClick={fetchData}>
              <FaSync className="me-1" />
              Actualiser
            </button>
            <button className="btn btn-outline-success">
              <FaDownload className="me-1" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Nav.Item>
          <Nav.Link eventKey="dashboard">
            <FaChartPie className="me-1" />
            Tableau de bord
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="auto-assign">
            <FaRobot className="me-1" />
            Assignation automatique
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="manual-assign">
            <FaUserEdit className="me-1" />
            Assignation manuelle
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="room-view">
            <FaBed className="me-1" />
            Vue chambres
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Contenu des onglets */}
      <Tab.Content>
        <Tab.Pane active={activeTab === 'dashboard'}>
          <AssignmentDashboard eventId={eventId} />
        </Tab.Pane>
        
        <Tab.Pane active={activeTab === 'auto-assign'}>
          <AutoAssignmentPanel 
            eventId={eventId}
            clients={clients}
            hotels={hotels}
            onAssignmentComplete={fetchData}
          />
        </Tab.Pane>
        
        <Tab.Pane active={activeTab === 'manual-assign'}>
          <ManualAssignmentTable 
            clients={clients}
            hotels={hotels}
            onUpdate={fetchData}
          />
        </Tab.Pane>
        
        <Tab.Pane active={activeTab === 'room-view'}>
          <RoomViewGrid 
            eventId={eventId}
            hotels={hotels}
            onRoomUpdate={fetchData}
          />
        </Tab.Pane>
      </Tab.Content>
    </div>
  );
};

export default AssignmentPage;
