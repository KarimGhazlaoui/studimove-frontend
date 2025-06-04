const AssignmentCard = ({ assignment, index, isSelected, onSelect, onModify }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`assignment-card card ${isSelected ? 'border-primary' : ''}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="form-check">
          <input 
            className="form-check-input"
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
          />
          <label className="form-check-label">
            <strong>{assignment.hotelName}</strong>
          </label>
        </div>
        
        <div className="badges">
          <span className="badge bg-secondary me-1">{assignment.roomType}</span>
          <span className="badge bg-info me-1">
            {assignment.clients.length}/{assignment.capacity}
          </span>
          <span className={`badge ${assignment.utilizationRate >= 75 ? 'bg-success' : 'bg-warning'}`}>
            {assignment.utilizationRate}%
          </span>
          {assignment.isMixed && (
            <span className="badge bg-warning ms-1">Mixte</span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="clients-preview">
          {assignment.clients.map((client, idx) => (
            <div key={idx} className="d-flex align-items-center mb-1">
              <div className="client-avatar me-2">
                {client.gender === 'Homme' ? 
                  <FaMale className="text-primary" /> : 
                  <FaFemale className="text-danger" />
                }
              </div>
              <span className="me-2">{client.name}</span>
              {client.clientType === 'VIP' && (
                <span className="badge bg-warning text-dark">VIP</span>
              )}
              {client.groupName && (
                <span className="badge bg-info ms-1">{client.groupName}</span>
              )}
            </div>
          ))}
        </div>

        {showDetails && (
          <div className="assignment-details mt-3 pt-3 border-top">
            <div className="row">
              <div className="col-6">
                <small className="text-muted">ID Chambre:</small><br />
                <code className="small">{assignment.roomId}</code>
              </div>
              <div className="col-6">
                <small className="text-muted">Capacité utilisée:</small><br />
                <div className="progress" style={{ height: '10px' }}>
                  <div 
                    className={`progress-bar ${assignment.utilizationRate >= 75 ? 'bg-success' : 'bg-warning'}`}
                    style={{ width: `${assignment.utilizationRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card-footer d-flex justify-content-between">
        <button 
          className="btn btn-sm btn-outline-info"
          onClick={() => setShowDetails(!showDetails)}
        >
          <FaEye className="me-1" />
          {showDetails ? 'Masquer' : 'Détails'}
        </button>
        
        <div className="btn-group btn-group-sm">
          <button 
            className="btn btn-outline-primary"
            onClick={() => onModify(assignment)}
            title="Modifier cette assignation"
          >
            <FaEdit />
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(assignment, null, 2))}
            title="Copier les détails"
          >
            <FaCopy />
          </button>
        </div>
      </div>
    </div>
  );
};
