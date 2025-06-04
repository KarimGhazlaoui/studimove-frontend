const AssignmentDashboard = ({ eventId }) => {
  const [assignmentData, setAssignmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [rules, setRules] = useState({
    allowMixedRooms: false,
    vipCanBeMixed: true,
    keepGroupsTogether: true,
    optimizeOccupancy: true,
    maxRoomCapacity: 4,
    preferSameHotel: true
  });

  return (
    <div className="assignment-dashboard">
      {/* Panneau de contrôle */}
      <div className="control-panel mb-4">
        <div className="row">
          <div className="col-md-8">
            <div className="d-flex gap-3 align-items-center">
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleAutoAssign}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Assignation en cours...
                  </>
                ) : (
                                  <>
                    <FaRobot className="me-2" />
                    Assignation automatique
                  </>
                )}
              </button>

              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <FaCog className="me-2" />
                Paramètres
              </button>

              <button 
                className="btn btn-outline-info"
                onClick={handlePreviewAssignments}
              >
                <FaEye className="me-2" />
                Aperçu
              </button>

              <button 
                className="btn btn-outline-warning"
                onClick={handleOptimizeExisting}
              >
                <FaChartLine className="me-2" />
                Optimiser
              </button>
            </div>
          </div>
          
          <div className="col-md-4 text-end">
            <AssignmentStats eventId={eventId} />
          </div>
        </div>

        {/* Paramètres avancés (collapsible) */}
        <Collapse in={showAdvancedSettings}>
          <div className="advanced-settings mt-3 p-3 border rounded bg-light">
            <h6><FaCog /> Paramètres d'assignation</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="form-check">
                  <input 
                    className="form-check-input"
                    type="checkbox"
                    id="allowMixedRooms"
                    checked={rules.allowMixedRooms}
                    onChange={(e) => setRules({...rules, allowMixedRooms: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="allowMixedRooms">
                    Autoriser les chambres mixtes
                  </label>
                </div>
                
                <div className="form-check">
                  <input 
                    className="form-check-input"
                    type="checkbox"
                    id="vipCanBeMixed"
                    checked={rules.vipCanBeMixed}
                    onChange={(e) => setRules({...rules, vipCanBeMixed: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="vipCanBeMixed">
                    VIP peuvent être en chambre mixte
                  </label>
                </div>

                <div className="form-check">
                  <input 
                    className="form-check-input"
                    type="checkbox"
                    id="keepGroupsTogether"
                    checked={rules.keepGroupsTogether}
                    onChange={(e) => setRules({...rules, keepGroupsTogether: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="keepGroupsTogether">
                    Garder les groupes ensemble
                  </label>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-check">
                  <input 
                    className="form-check-input"
                    type="checkbox"
                    id="optimizeOccupancy"
                    checked={rules.optimizeOccupancy}
                    onChange={(e) => setRules({...rules, optimizeOccupancy: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="optimizeOccupancy">
                    Optimiser l'occupation
                  </label>
                </div>

                <div className="mb-2">
                  <label className="form-label">Capacité max par chambre</label>
                  <select 
                    className="form-select form-select-sm"
                    value={rules.maxRoomCapacity}
                    onChange={(e) => setRules({...rules, maxRoomCapacity: parseInt(e.target.value)})}
                  >
                    <option value={2}>2 personnes</option>
                    <option value={3}>3 personnes</option>
                    <option value={4}>4 personnes</option>
                    <option value={6}>6 personnes</option>
                  </select>
                </div>

                <div className="form-check">
                  <input 
                    className="form-check-input"
                    type="checkbox"
                    id="preferSameHotel"
                    checked={rules.preferSameHotel}
                    onChange={(e) => setRules({...rules, preferSameHotel: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="preferSameHotel">
                    Privilégier le même hôtel pour les groupes
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Collapse>
      </div>

      {/* Résultats de l'assignation */}
      {assignmentData && (
        <AssignmentResults 
          data={assignmentData}
          onConfirm={handleConfirmAssignments}
          onModify={handleModifyAssignment}
          onCancel={handleCancelAssignments}
        />
      )}
    </div>
  );
};
