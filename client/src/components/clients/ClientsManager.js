const ClientsManager = ({ eventId }) => {
  const [clients, setClients] = useState([]);
  const [assignmentSuggestions, setAssignmentSuggestions] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="clients-manager">
      <div className="actions-bar mb-3">
        <div className="d-flex gap-2">
          {/* Bouton principal d'assignation */}
          <button 
            className="btn btn-primary"
            onClick={handleAutoAssignPreview}
            disabled={unassignedClients.length === 0}
          >
            <FaRobot className="me-2" />
            Assigner automatiquement ({unassignedClients.length} clients)
          </button>

          {/* Bouton de réassignation complète */}
          <button 
            className="btn btn-warning"
            onClick={handleReassignAll}
          >
            <FaRedo className="me-2" />
            Réassigner tout
          </button>

          {/* Bouton d'optimisation */}
          <button 
            className="btn btn-info"
            onClick={handleOptimizeAssignments}
          >
            <FaChartLine className="me-2" />
            Optimiser les assignations
          </button>
        </div>
      </div>

      {/* Aperçu des suggestions avant confirmation */}
      {showPreview && (
        <AssignmentPreview 
          suggestions={assignmentSuggestions}
          onConfirm={handleConfirmAssignments}
          onCancel={() => setShowPreview(false)}
        />
      )}

      {/* Tableau des clients avec actions individuelles */}
      <ClientsTable 
        clients={clients}
        onAssignIndividual={handleAssignIndividual}
        onUnassign={handleUnassign}
      />
    </div>
  );
};