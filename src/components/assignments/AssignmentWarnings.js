const AssignmentWarnings = ({ client, selectedRoommates, roomCapacity }) => {
  const warnings = [];
  const genders = [client.gender, ...selectedRoommates.map(r => r.gender)];
  const uniqueGenders = [...new Set(genders)];
  
  // Vérification mixité
  if (uniqueGenders.length > 1 && client.clientType !== 'VIP') {
    warnings.push({
      type: 'warning',
      message: 'Chambre mixte détectée. Seuls les clients VIP peuvent être en chambre mixte.',
      icon: <FaExclamationTriangle />
    });
  }

  // Vérification capacité
  const totalOccupants = 1 + selectedRoommates.length;
  if (totalOccupants > roomCapacity) {
    warnings.push({
      type: 'danger',
      message: `Capacité dépassée: ${totalOccupants} personnes pour ${roomCapacity} places maximum.`,
      icon: <FaExclamationCircle />
    });
  }

  // Vérification groupe
  if (client.groupName) {
    const roommatesFromSameGroup = selectedRoommates.filter(r => r.groupName === client.groupName);
    if (roommatesFromSameGroup.length === 0 && selectedRoommates.length > 0) {
      warnings.push({
        type: 'info',
        message: 'Ce client fait partie d\'un groupe mais les colocataires sélectionnés n\'en font pas partie.',
        icon: <FaInfoCircle />
      });
    }
  }

  if (warnings.length === 0) {
    return (
      <Alert variant="success">
        <FaCheckCircle className="me-2" />
        Cette assignation respecte toutes les règles.
      </Alert>
    );
  }

  return (
    <div className="assignment-warnings">
      {warnings.map((warning, index) => (
        <Alert key={index} variant={warning.type}>
          {warning.icon}
          <span className="ms-2">{warning.message}</span>
        </Alert>
      ))}
    </div>
  );
};