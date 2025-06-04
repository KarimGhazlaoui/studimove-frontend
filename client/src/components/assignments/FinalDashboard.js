const FinalDashboard = ({ eventData }) => {
  return (
    <div className="final-dashboard">
      <div className="row">
        <div className="col-md-8">
          <div className="assignments-summary">
            <h4>🎯 Résumé des assignations</h4>
            <div className="metrics-grid">
              <div className="metric success">
                <FaCheckCircle />
                <span>{eventData.assignedClients} clients assignés</span>
              </div>
              <div className="metric info">
                <FaBed />
                <span>{eventData.roomsUsed} chambres utilisées</span>
              </div>
              <div className="metric warning">
                <FaChartPie />
                <span>{eventData.occupancyRate}% d'occupation</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="quick-actions">
            <h5>Actions rapides</h5>
            <div className="d-grid gap-2">
              <Button variant="primary">
                <FaDownload className="me-2" />
                Exporter les assignations
              </Button>
              <Button variant="outline-success">
                <FaEnvelope className="me-2" />
                Envoyer par email
              </Button>
              <Button variant="outline-info">
                <FaPrint className="me-2" />
                Imprimer la liste
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};