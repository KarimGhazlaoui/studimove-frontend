import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FaHotel, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EventHotelLink = ({ event }) => {
  return (
    <div className="d-flex justify-content-between align-items-center p-3 border rounded">
      <div>
        <h6 className="mb-1">
          <FaHotel className="me-2 text-primary" />
          Gestion des hôtels
        </h6>
        <div className="d-flex gap-2">
          <Badge bg="primary">{event.totalHotels || 0} hôtels</Badge>
          <Badge bg="success">{event.totalRooms || 0} chambres</Badge>
          <Badge bg="info">{event.totalCapacity || 0} places</Badge>
        </div>
      </div>
      <Button 
        as={Link} 
        to={`/events/${event._id}/hotels`}
        variant="outline-primary"
        size="sm"
      >
        Gérer <FaArrowRight className="ms-1" />
      </Button>
    </div>
  );
};

export default EventHotelLink;