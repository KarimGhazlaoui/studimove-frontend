const RoomCard = ({ room, roomId, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  
  const getCardClass = () => {
    if (room.clients.length === 0) return 'border-success';
    if (room.clients.length === room.capacity) return 'border-danger';
    if (room.isMixed) return 'border-info';
    return 'border-warning';
  };

  const getOccupancyBadge = () => {
    const occupancy = Math.round((room.clients.length / room.capacity) * 100);
    if (occupancy === 0) return <Badge bg="success">Libre</Badge>;
    if (occupancy === 100) return <Badge bg="danger">Complète</Badge>;
    return <Badge bg="warning">{occupancy}%</Badge>;
  };

  return (
    <>
      <Card className={`room-card h-100 ${getCardClass()}`}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{room.hotelName}</strong>
            <br />
            <small className="text-muted">Chambre {room.roomType}</small>
          </div>
          {getOccupancyBadge()}
        </Card.Header>

        <Card.Body>
          <div className="room-info mb-3">
            <div className="d-flex justify-content-between text-sm">
              <span>Capacité:</span>
              <span>{room.clients.length}/{room.capacity}</span>
            </div>
            <div className="progress mt-1" style={{ height: '6px' }}>
              <div 
                className={`progress-bar ${room.clients.length === room.capacity ? 'bg-danger' : 'bg-primary'}`}
                style={{ width: `${(room.clients.length / room.capacity) * 100}%` }}
              />
            </div>
          </div>

          <div className="clients-list">
            {room.clients.length === 0 ? (
              <div className="text-center text-muted">
                <FaBed className="mb-2" />
                <br />
                <small>Chambre libre</small>
              </div>
            ) : (
              room.clients.map((client, index) => (
                <div key={index} className="client-item d-flex align-items-center mb-1">
                  <div className="client-avatar me-2">
                    {client.gender === 'Homme' ? 
                      <FaMale className="text-primary" size={14} /> : 
                      <FaFemale className="text-danger" size={14} />
                    }
                  </div>
                  <div className="flex-grow-1">
                    <div className="client-name">{client.name}</div>
                    {client.groupName && (
                      <small className="text-muted">{client.groupName}</small>
                    )}
                  </div>
                  {client.clientType === 'VIP' && (
                    <Badge bg="warning" className="ms-1">VIP</Badge>
                  )}
                </div>
              ))
            )}
          </div>

          {room.isMixed && (
            <Alert variant="info" className="mt-2 mb-0 py-1">
              <small><FaExclamationTriangle className="me-1" />Chambre mixte</small>
            </Alert>
          )}
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between">
          <Button 
            size="sm" 
            variant="outline-primary"
            onClick={() => setShowModal(true)}
          >
            <FaEye className="me-1" />
            Gérer
          </Button>
          
          <div className="btn-group btn-group-sm">
            <Button 
              variant="outline-success"
              disabled={room.clients.length === room.capacity}
              title="Ajouter un client"
            >
              <FaPlus />
            </Button>
            <Button 
              variant="outline-warning"
              disabled={room.clients.length === 0}
              title="Retirer un client"
            >
              <FaMinus />
            </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* Modal de gestion de chambre */}
      <RoomManagementModal 
        show={showModal}
        room={room}
        roomId={roomId}
        onHide={() => setShowModal(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};