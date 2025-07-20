// /* UI component: AppNavbar (moved from components/Navbar.js) */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Button, Image } from 'react-bootstrap';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../ui/Navbar.css';

function AppNavbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/');
    } catch (err) {
      // Optionally handle error
      console.error('Sign-out error:', err);
    }
  };

  return (
    <Navbar bg="light" expand="lg" fixed="top" className="pw-navbar">
      <Container fluid>
        <Navbar.Brand
          as={Link}
          to="/"
          className="app-logo d-flex align-items-center"
        >
          <img
            src="/logo192.png"
            alt="PW Logo"
            className="navbar-logo-img"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Front Office" id="front-office-dropdown">
              <NavDropdown.Item as={Link} to="/transaction-register">Transaction Register</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/shift-handover">Shift Handover</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/log-book">Log Book</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/travel-desk">Travel Desk</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/front-office-checklist">Front Office Checklists</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Housekeeping" id="housekeeping-dropdown">
              <NavDropdown.Item as={Link} to="/housekeeping-checklist">Housekeeping Checklists</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="F&B" id="fnb-dropdown">
              <NavDropdown.Item as={Link} to="/restaurant-checklist">Restaurant Checklists</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Stores" id="stores-dropdown">
              <NavDropdown.Item as={Link} to="/stores-checklist">Stores Checklists</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Team Lead" id="teamlead-dropdown">
              <NavDropdown.Item as={Link} to="/reports">Reports</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/user-management">User Management</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          {/* User info and sign out button on right */}
          <Nav className="ms-auto align-items-center">
            {user && (
              <>
                <div className="d-flex align-items-center me-2">
                  <Image
                    src={user.photoURL || 'https://via.placeholder.com/30'}
                    alt="User profile"
                    roundedCircle
                    width={32}
                    height={32}
                    style={{ border: '2px solid white' }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/30'; }}
                  />
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleSignOut}
                  className="ms-2"
                >
                  Sign Out
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
