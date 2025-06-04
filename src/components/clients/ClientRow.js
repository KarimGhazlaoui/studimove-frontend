const ClientRow = ({ client, hotels, onAssign, onUnassign }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);

  return (
    <tr className={`client-row ${client.isAssigned ? 'table-success' : 'table-warning'}`}>
      <td>
        <div className="d-flex align-items-center">
          <ClientAvatar client={client} />
          <div className="ms-2">
            <strong>{client.fullName}</strong>
            <br />
            <small className="text-muted">{client.phone}</small>
          </div>
        </div>
      </td>
      
      <td>
        <ClientTypeBadge type={client.clientType} />
        {client.gender === 'Homme' ? <FaMale className="ms-1 text-primary" /> : <FaFemale className="ms-1 text-danger" />}
      </td>
      
      <td>
        {client.groupName ? (
          <span className="badge bg-info">{client.groupName} ({client.groupSize})</span>
        ) : (
          <span className="text-muted">Solo</span>
        )}
      </td>
      
      <td>
        {client.isAssigned ? (
          <div className="assignment-info">
            <strong className="text-success">{client.assignedHotel?.name}</strong>
            <br />
            <small className="text-muted">
              Chambre {client.roomAssignment?.roomType} - {client.roomAssignment?.roommates?.length + 1}/{client.roomAssignment?.roomCapacity}
            </small>
          </div>
        ) : (
          <span className="text-warning">Non assigné</span>
        )}
      </td>
      
      <td>
        <div className="btn-group btn-group-sm">
          {!client.isAssigned ? (
            <>
              <button 
                className="btn btn-outline-primary"
                onClick={() => setShowAssignModal(true)}
                title="Assigner manuellement"
              >
                <FaUserPlus />
              </button>
              <button 
                className="btn btn-outline-success"
                onClick={() => handleAutoAssignSingle(client._id)}
                title="Assignation automatique"
              >
                <FaRobot />
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-outline-info"
                onClick={() => handleViewRoomDetails(client)}
                title="Voir la chambre"
              >
                <FaEye />
              </button>
              <button 
                className="btn btn-outline-warning"
                onClick={() => setShowAssignModal(true)}
                title="Réassigner"
              >
                <FaExchangeAlt />
              </button>
              <button 
                className="btn btn-outline-danger"
                onClick={() => onUnassign(client._id)}
                title="Désassigner"
              >
                <FaUserMinus />
              </button>
            </>
          )}
        </div>
      </td>

      {/* Modal d'assignation manuelle */}
      <ManualAssignmentModal 
        show={showAssignModal}
        client={client}
        hotels={hotels}
        onHide={() => setShowAssignModal(false)}
        onAssign={onAssign}
      />
    </tr>
  );
};