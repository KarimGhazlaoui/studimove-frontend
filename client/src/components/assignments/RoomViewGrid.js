const RoomViewGrid = ({ eventId, hotels, onRoomUpdate }) => {
  const [roomData, setRoomData] = useState({});
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all'); // all, occupied, available, mixed

  useEffect(() => {
    fetchRoomData();
  }, [eventId, selectedHotel]);

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/assignments/rooms/${eventId}?hotel=${selectedHotel}`);
      const data = await response.json();
      setRoomData(data.rooms || {});
    } catch (error) {
      console.error('Erreur chargement chambres:', error);
    }
  };

  const filteredRooms = Object.entries(roomData).filter(([roomId, room]) => {
    switch (roomFilter) {
      case 'occupied':
        return room.clients.length > 0;
      case 'available':
        return room.clients.length === 0;
      case 'mixed':
        return room.isMixed;
      default:
        return true;
    }
  });

  return (
    <div className="room-view-grid">
      {/* Filtres */}
      <div className="filters mb-4">
        <div className="row">
          <div className="col-md-6">
            <select 
              className="form-select"
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
            >
              <option value="all">Tous les hôtels</option>
              {hotels.map(hotel => (
                <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <select 
              className="form-select"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">Toutes les chambres</option>
              <option value="occupied">Chambres occupées</option>
              <option value="available">Chambres disponibles</option>
              <option value="mixed">Chambres mixtes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="legend mb-3">
        <div className="d-flex gap-3">
          <div className="legend-item">
            <span className="badge bg-success me-1">■</span>
            Disponible
          </div>
          <div className="legend-item">
            <span className="badge bg-warning me-1">■</span>
            Partiellement occupée
          </div>
          <div className="legend-item">
            <span className="badge bg-danger me-1">■</span>
            Complète
          </div>
          <div className="legend-item">
            <span className="badge bg-info me-1">■</span>
            Mixte
          </div>
        </div>
      </div>

      {/* Grille des chambres */}
      <div className="rooms-grid">
        <div className="row">
          {filteredRooms.map(([roomId, room]) => (
            <div key={roomId} className="col-lg-3 col-md-4 col-sm-6 mb-3">
              <RoomCard 
                room={room}
                roomId={roomId}
                onUpdate={onRoomUpdate}
              />
            </div>
          ))}
        </div>
        
        {filteredRooms.length === 0 && (
          <div className="text-center py-5">
            <FaBed size={48} className="text-muted mb-3" />
            <p className="text-muted">Aucune chambre trouvée avec ces filtres</p>
          </div>
        )}
      </div>
    </div>
  );
};