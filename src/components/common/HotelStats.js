import React from 'react';
import { Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { FaBed, FaUsers, FaPercentage } from 'react-icons/fa';

const HotelStats = ({ assignment }) => {
  const totalCapacity = assignment.availableRooms.reduce((sum, room) => 
    sum + (room.quantity * room.bedCount), 0);
  
  const totalAssigned = assignment.availableRooms.reduce((sum, room) => 
    sum + ((room.assignedRooms || 0) * room.bedCount), 0);
  
  const occupancyRate = totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0;

  return (
    <Row className="g-2">
      <Col md={4}>
        <Card className="text-center h-100">
          <Card.Body className="py-2">
            <FaBed className="text-primary mb-1" />
            <div className="small">
              <strong>{assignment.availableRooms.reduce((sum, room) => sum + room.quantity, 0)}</strong>
              <div className="text-muted">Chambres</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center h-100">
          <Card.Body className="py-2">
            <FaUsers className="text-success mb-1" />
            <div className="small">
              <strong>{totalAssigned}/{totalCapacity}</strong>
              <div className="text-muted">Places</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center h-100">
          <Card.Body className="py-2">
            <FaPercentage className="text-info mb-1" />
            <div className="small">
              <strong>{Math.round(occupancyRate)}%</strong>
              <div className="text-muted">Occupation</div>
            </div>
            <ProgressBar 
              now={occupancyRate} 
              size="sm"
              variant={occupancyRate >= 100 ? 'danger' : occupancyRate >= 80 ? 'warning' : 'success'}
              className="mt-1"
              style={{height: '4px'}}
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HotelStats;