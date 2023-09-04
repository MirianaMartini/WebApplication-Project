import { Navbar, Container, Button } from "react-bootstrap";
import { BsJournals, BsPersonCircle } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavBar.css";
import { useNavigate } from "react-router-dom";

function NavBar(props) {
  const navigate = useNavigate();

  return (
    <Navbar
      bg="primary"
      variant="dark"
      className="navBar"
      fixed="top"
    >
      <Container fluid>
        <Navbar.Brand>
          <BsJournals className="navBar-icon" style={{ marginRight: "5px" }} />
          {"Piano degli Studi"}
        </Navbar.Brand>
        <Navbar.Brand className="justify-content-center">
          {props.loggedIn ? props.user.nomecompleto : ""}
        </Navbar.Brand>
        <Navbar.Brand className="justify-content-right">
          {props.flag ? ( //se siamo nella NavBar Login 
            <Button variant="outline-light" onClick={() => navigate("/")}>
              Torna Indietro
            </Button>
          ) : !props.loggedIn ? ( //se non siamo loggati
            <Button variant="outline-light" onClick={() => navigate("/login")}>
              LogIn
              <BsPersonCircle
                className="navBar-icon"
                style={{ marginLeft: "7px" }}
              />
            </Button>
          ) : ( //se siamo loggati
            <Button variant="outline-light" onClick={props.doLogout}>
              LogOut
              <FaUserCircle
                className="navBar-icon"
                style={{ marginLeft: "7px" }}
              />
            </Button>
          )}
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default NavBar;
