import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHotel, FaUsers, FaChartPie, FaBed } from 'react-icons/fa';

const Header = () => {
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaHotel className="me-2" />
          StudiMove Hotel
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
            >
              <FaChartPie className="me-1" />
              Dashboard
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/hotels" 
              active={location.pathname.startsWith('/hotels')}
            >
              <FaHotel className="me-1" />
              Hôtels
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/clients" 
              active={location.pathname.startsWith('/clients')}
            >
              <FaUsers className="me-1" />
              Clients
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/assignments" 
              active={location.pathname.startsWith('/assignments')}
            >
              <FaBed className="me-1" />
              Assignations
            </Nav.Link>
          </Nav>
          
          <Nav>
            <Nav.Link as={Link} to="/login">
              Connexion
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;