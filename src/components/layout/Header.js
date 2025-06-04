import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaHotel, FaUsers, FaCalendarAlt, FaBed, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            <FaHotel className="me-2" />
            StudiMove Hotel
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user && (
            <Nav className="me-auto">
              <LinkContainer to="/">
                <Nav.Link>
                  <FaHome className="me-1" />
                  Dashboard
                </Nav.Link>
              </LinkContainer>
              
              <LinkContainer to="/events">
                <Nav.Link>
                  <FaCalendarAlt className="me-1" />
                  Événements
                </Nav.Link>
              </LinkContainer>
              
              <LinkContainer to="/hotels">
                <Nav.Link>
                  <FaHotel className="me-1" />
                  Hôtels
                </Nav.Link>
              </LinkContainer>
              
              <LinkContainer to="/clients">
                <Nav.Link>
                  <FaUsers className="me-1" />
                  Clients
                </Nav.Link>
              </LinkContainer>
              
              <NavDropdown title={<><FaBed className="me-1" />Assignations</>} id="assignments-dropdown">
                <LinkContainer to="/assignments/current">
                  <NavDropdown.Item>Assignations actuelles</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <LinkContainer to="/assignments/new">
                  <NavDropdown.Item>Nouvelle assignation</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            </Nav>
          )}
          
          <Nav className="ms-auto">
            {user ? (
              <NavDropdown title={<><FaUser className="me-1" />{user.firstName}</>} id="user-dropdown">
                <LinkContainer to="/profile">
                  <NavDropdown.Item>
                    <FaUser className="me-2" />
                    Mon profil
                  </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Déconnexion
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link>Connexion</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
