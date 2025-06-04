const AssignmentStats = ({ eventId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/assignments/stats/${eventId}`);
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Erreur stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh toutes les 30s
    return () => clearInterval(interval);
  }, [eventId]);

  if (!stats) return <div>Chargement...</div>;

  return (
    <div className="assignment-stats">
      <div className="row g-2">
        <div className="col-6">
          <div className="stat-mini text-center p-2 bg-primary text-white rounded">
            <div className="h4 mb-0">{stats.assignedClients}</div>
            <small>Assignés</small>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-mini text-center p-2 bg-warning text-white rounded">
            <div className="h4 mb-0">{stats.unassignedClients}</div>
            <small>En attente</small>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-mini text-center p-2 bg-success text-white rounded">
            <div className="h4 mb-0">{stats.roomsUsed}</div>
            <small>Chambres</small>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-mini text-center p-2 bg-info text-white rounded">
            <div className="h4 mb-0">{stats.occupancyRate}%</div>
            <small>Occupation</small>
          </div>
        </div>
      </div>
    </div>
  );
};