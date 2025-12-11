import { NavLink } from "react-router-dom";
import { Navbar as BSNavbar, Nav, Container, Button } from "react-bootstrap";

interface NavbarProps {
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  onLogout: () => void;
}

function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={NavLink} to="/home">
          🎌 AnimeDrop
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/my-list">
              My List
            </Nav.Link>
            <Nav.Link as={NavLink} to="/discovery">
              Discovery
            </Nav.Link>
            <Nav.Link as={NavLink} to="/users">
              Users
            </Nav.Link>
            <Nav.Link as={NavLink} to="/notifications">
              Notifications
            </Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link as={NavLink} to={`/users/${user.id}`}>
              <img src={user.avatar} alt={user.username} width="30" height="30" className="rounded-circle me-2" />
              {user.username}
            </Nav.Link>
            <Button variant="outline-light" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;
