const AssignmentPreview = ({ suggestions, onConfirm, onCancel }) => {
  return (
    <Modal show={true} onHide={onCancel} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEye className="me-2" />
          Aperçu des assignations proposées
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="assignment-summary mb-4">
          <div className="row">
            <div className="col-md-3">
              <div className="stat-card text-center p-3 bg-primary text-white rounded">
                <h3>{suggestions.totalAssigned}</h3>
                <p>Clients assignés</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card text-center p-3 bg-success text-white rounded">
                <h3>{suggestions.roomsUsed}</h3>
                <p>Chambres utilisées</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card text-center p-3 bg-warning text-white rounded">
                <h3>{suggestions.mixedRooms}</h3>
                <p>Chambres mixtes</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card text-center p-3 bg-info text-white rounded">
                <h3>{suggestions.occupancyRate}%</h3>
                <p>Taux d'occupation</p>
              </div>
            </div>
          </div>
        </div>

        {suggestions.warnings.length > 0 && (
          <Alert variant="warning">
            <FaExclamationTriangle className="me-2" />
            <strong>Avertissements :</strong>
            <ul className="mb-0 mt-2">
              {suggestions.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="assignments-list">
          {suggestions.assignments.map((assignment, index) => (
            <AssignmentCard key={index} assignment={assignment} />
          ))}
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          <FaTimes className="me-2" />
          Annuler
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          <FaCheck className="me-2" />
          Confirmer les assignations
        </Button>
      </Modal.Footer>
    </Modal>
  );
};