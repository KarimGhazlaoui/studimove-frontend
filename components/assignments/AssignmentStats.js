import React from 'react';
import { Card, Row, Col, ProgressBar, Table, Badge } from 'react-bootstrap';
import { 
  FaUsers, 
  FaHotel, 
  FaBed, 
  FaChartPie, 
  FaMale, 
  FaFemale,
  FaStar,
  FaUserTie
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AssignmentStats = ({ stats, assignments, clients }) => {
  if (!stats) {
    return (
      <Card>
        <Card.Body className="text-center">
          <p>Chargement des statistiques...</p>
        </Card.Body>
      </Card>
    );
  }

  // Données pour les graphiques
  const genderData = [
    { name: 'Hommes', value: stats.byGender.Homme || 0, color: '#0d6efd' },
    { name: 'Femmes', value: stats.byGender.Femme || 0, color: '#dc3545' },
    { name: 'Autres', value: stats.byGender.Autre || 0, color: '#6c757d' }
  ];

  const typeData = Object.entries(stats.byType).map(([type, data]) => ({
    name: type,
    total: data.total,
    assigned: data.assigned,
    unassigned: data.unassigned
  }));

  const hotelOccupancyData = stats.byHotel.map(hotel => ({
    name: hotel.hotelName.substring(0, 15) + (hotel.hotelName.length > 15 ? '...' : ''),
    occupancy: hotel.occupancyRate,
    capacity: hotel.totalCapacity,
    assigned: hotel.totalAssigned
  }));

  return (
    <div>
      {/* STATISTIQUES GÉNÉRALES */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <FaUsers size={32} className="mb-2" />
              <h3>{stats.totalClients}</h3>
              <p className="mb-0">Total Clients</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <FaUsers size={32} className="mb-2" />
              <h3>{stats.assignedClients}</h3>
              <p className="mb-0">Assignés</p>
              <small>
                {stats.totalClients > 0 ? 
                  Math.round((stats.assignedClients / stats.totalClients) * 100) : 0}%
              </small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center bg-warning text-white">
            <Card.Body>
              <FaBed size={32} className="mb-2" />
              <h3>{stats.roomsStats.totalRooms}</h3>
              <p className="mb-0">Chambres</p>
              <small>{stats.roomsStats.occupiedRooms} occupées</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <FaHotel size={32} className="mb-2" />
              <h3>{stats.byHotel.length}</h3>
              <p className="mb-0">Hôtels</p>
              <small>En utilisation</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* GRAPHIQUES */}
      <Row className="mb-4">
        {/* RÉPARTITION PAR GENRE */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FaChartPie className="me-2" />
                Répartition par Genre
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* ASSIGNATION PAR TYPE */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FaUsers className="me-2" />
                Assignation par Type de Client
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="assigned" fill="#28a745" name="Assignés" />
                  <Bar dataKey="unassigned" fill="#ffc107" name="Non assignés" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* TAUX D'OCCUPATION PAR HÔTEL */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FaHotel className="me-2" />
                Taux d'Occupation par Hôtel
              </h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hotelOccupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'occupancy' ? `${value}%` : value,
                      name === 'occupancy' ? 'Taux d\'occupation' : 
                      name === 'assigned' ? 'Clients assignés' : 'Capacité totale'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="occupancy" fill="#17a2b8" name="Taux d'occupation (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* DÉTAILS PAR TYPE DE CLIENT */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Détails par Type de Client</h6>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Total</th>
                    <th>Assignés</th>
                    <th>Non assignés</th>
                    <th>Taux d'assignation</th>
                    <th>Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.byType).map(([type, data]) => {
                    const rate = data.total > 0 ? (data.assigned / data.total) * 100 : 0;
                    
                    return (
                      <tr key={type}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {type === 'VIP' && <FaStar className="text-danger" />}
                            {type === 'Influenceur' && <FaStar className="text-warning" />}
                            {type === 'Staff' && <FaUserTie className="text-dark" />}
                            {type === 'Groupe' && <FaUsers className="text-info" />}
                            {type === 'Solo' && <FaUsers className="text-secondary" />}
                            <strong>{type}</strong>
                          </div>
                        </td>
                        <td>
                          <Badge bg="primary">{data.total}</Badge>
                        </td>
                        <td>
                          <Badge bg="success">{data.assigned}</Badge>
                        </td>
                        <td>
                          <Badge bg="warning">{data.unassigned}</Badge>
                        </td>
                        <td>
                          <strong>{rate.toFixed(1)}%</strong>
                        </td>
                        <td>
                          <ProgressBar 
                            now={rate} 
                            variant={rate === 100 ? 'success' : rate > 75 ? 'info' : rate > 50 ? 'warning' : 'danger'}
                            style={{ minWidth: '100px' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssignmentStats;