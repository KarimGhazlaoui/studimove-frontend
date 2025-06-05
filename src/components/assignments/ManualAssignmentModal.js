const ManualAssignmentModal = ({ show, client, hotels, onHide, onAssign }) => {
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [availableRoommates, setAvailableRoommates] = useState([]);
  const [selectedRoommates, setSelectedRoommates] = useState([]);

  const handleHotelChange = async (hotelId) => {
    setSelectedHotel(hotelId);
    setSelectedRoomType('');
    
    if (hotelId) {
      // Récupérer les clients déjà assignés à cet hôtel pour les colocataires potentiels
      const response = await fetch(`/clients/hotel/${hotelId}/available-roommates`);
      const data = await response.json();
      setAvailableRoommates(data.clients || []);
    }
  };

  const handleSubmit = () => {
    onAssign({
      clientId: client._id,
      hotelId: selectedHotel,
      roomType: selectedRoomType,
      roommates: selectedRoommates
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUserPlus className="me-2" />
          Assigner {client.fullName}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <form>
          {/* Informations du client */}
          <div className="client-info mb-4 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-6">
                <strong>{client.fullName}</strong><br />
                <small className="text-muted">{client.phone}</small>
              </div>
              <div className="col-md-6">
                <ClientTypeBadge type={client.clientType} />
                <span className="ms-2">
                  {client.gender === 'Homme' ? <FaMale className="text-primary" /> : <FaFemale className="text-danger" />}
                  {client.gender}
                </span>
              </div>
            </div>
            {client.groupName && (
              <div className="mt-2">
                <span className="badge bg-info">{client.groupName} ({client.groupSize} personnes)</span>
              </div>
            )}
          </div>

          {/* Sélection de l'hôtel */}
          <div className="mb-3">
            <label className="form-label">Hôtel *</label>
            <select 
              className="form-select"
              value={selectedHotel}
              onChange={(e) => handleHotelChange(e.target.value)}
              required
            >
              <option value="">Choisir un hôtel...</option>
              {hotels.map(hotel => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.name} - {hotel.getAvailableCapacity()} places disponibles
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du type de chambre */}
          {selectedHotel && (
            <div className="mb-3">
              <label className="form-label">Type de chambre *</label>
              <select 
                className="form-select"
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                required
              >
                <option value="">Choisir un type...</option>
                {hotels.find(h => h._id === selectedHotel)?.roomTypes.map(roomType => (
                  <option key={roomType.type} value={roomType.type}>
                    {roomType.type} - Capacité {roomType.capacity} personnes
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sélection des colocataires */}
          {selectedRoomType && availableRoommates.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Colocataires potentiels (optionnel)</label>
              <div className="available-roommates">
                {availableRoommates
                  .filter(roommate => 
                    // Règles de compatibilité
                    client.canBeMixed || roommate.gender === client.gender
                  )
                  .map(roommate => (
                    <div key={roommate._id} className="form-check">
                      <input 
                        className="form-check-input"
                        type="checkbox"
                        id={`roommate-${roommate._id}`}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoommates([...selectedRoommates, roommate]);
                          } else {
                            setSelectedRoommates(selectedRoommates.filter(r => r._id !== roommate._id));
                          }
                        }}
                      />
                      <label className="form-check-label" htmlFor={`roommate-${roommate._id}`}>
                        {roommate.fullName} 
                        <span className="ms-2">
                          {roommate.gender === 'Homme' ? <FaMale className="text-primary" /> : <FaFemale className="text-danger" />}
                        </span>
                        {roommate.clientType === 'VIP' && <span className="badge bg-warning ms-2">VIP</span>}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Avertissements */}
          {selectedRoomType && (
            <AssignmentWarnings 
              client={client}
              selectedRoommates={selectedRoommates}
              roomCapacity={hotels.find(h => h._id === selectedHotel)?.roomTypes.find(rt => rt.type === selectedRoomType)?.capacity}
            />
          )}
        </form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!selectedHotel || !selectedRoomType}
        >
          <FaCheck className="me-2" />
          Assigner
        </Button>
      </Modal.Footer>
    </Modal>
  );
};