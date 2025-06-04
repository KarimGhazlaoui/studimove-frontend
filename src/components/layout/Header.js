import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaHotel, FaUsers, FaHome } from 'react-icons/fa';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">
          <FaHotel className="me-2" />
          StudiMove Hotel
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">
              <FaHome className="me-1" />
              Tableau de bord
            </Nav.Link>
            <Nav.Link href="/hotels">
              <FaHotel className="me-1" />
              Hôtels
            </Nav.Link>
            <Nav.Link href="/clients">
              <FaUsers className="me-1" />
              Clients
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
