const AssignmentResults = ({ data, onConfirm, onModify, onCancel }) => {
  const [selectedAssignments, setSelectedAssignments] = useState([]);

  return (
    <div className="assignment-results">
      <div className="results-header d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FaClipboardList className="me-2" />
          Résultats de l'assignation
        </h5>
        <div className="btn-group">
          <button 
            className="btn btn-success"
            onClick={() => onConfirm(data.assignments)}
          >
            <FaCheck className="me-2" />
            Confirmer tout ({data.totalAssigned} clients)
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => onConfirm(selectedAssignments)}
            disabled={selectedAssignments.length === 0}
          >
            <FaCheckSquare className="me-2" />
            Confirmer sélection ({selectedAssignments.length})
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            <FaTimes className="me-2" />
            Annuler
          </button>
        </div>
      </div>

      {/* Résumé */}
      <div className="summary-cards mb-4">
        <div className="row">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-primary">{data.totalAssigned}</h3>
                <p className="mb-0">Clients assignés</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-success">{data.roomsUsed}</h3>
                <p className="mb-0">Chambres utilisées</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-info">{data.occupancyRate}%</h3>
                <p className="mb-0">Taux d'occupation</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-warning">{data.mixedRooms}</h3>
                <p className="mb-0">Chambres mixtes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avertissements */}
      {data.warnings.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Avertissements :</strong>
          <ul className="mb-0 mt-2">
            {data.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Liste des assignations */}
      <div className="assignments-list">
        <div className="row">
          {data.assignments.map((assignment, index) => (
            <div key={index} className="col-md-6 mb-3">
              <AssignmentCard 
                assignment={assignment}
                index={index}
                isSelected={selectedAssignments.includes(assignment)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedAssignments([...selectedAssignments, assignment]);
                  } else {
                    setSelectedAssignments(selectedAssignments.filter(a => a !== assignment));
                  }
                }}
                onModify={onModify}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Clients non assignés */}
      {data.unassignedClients.length > 0 && (
        <div className="unassigned-clients mt-4">
          <h6 className="text-warning">
            <FaExclamationCircle className="me-2" />
            Clients non assignés ({data.unassignedClients.length})
          </h6>
          <div className="list-group">
            {data.unassignedClients.map((client, index) => (
              <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{client.name}</strong>
                  <br />
                  <small className="text-muted">{client.reason}</small>
                </div>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onclick={() => onModify(client)}
                >
                  <FaUserPlus /> Assigner manuellement
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};