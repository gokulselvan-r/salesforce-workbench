import React from "react";
import { Nav, Image, Navbar, Container, Button } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";


export default class NavBar extends React.Component {
    logout = (e) => {
        e.preventDefault();
        window.location = '/auth/logout';
}
  render() {
    return (
      <Navbar variant="dark" expand="lg" bg="dark" className="navbar-transparent navbar-theme-primary ">
  <Container className="position-relative">
    <Nav className="navbar-nav-hover align-items-lg-left" style={{flex:'1'}}>
      <Navbar.Brand className="me-lg-3">
          GandS - Salesforce Integration
    </Navbar.Brand>
      </Nav>
      {this.props.user == null ? null :
       <Nav className="navbar-nav-hover align-items-lg-center">
       <Navbar.Brand className="me-lg-3">
         {console.log(this.props)}
       <Image src='https://gandscom-dev-ed--c.documentforce.com/profilephoto/005/F' /> &nbsp;
           Hello, {this.props.user.display_name}
     </Navbar.Brand>
       </Nav>
    }

          {
            /*   Logout button */
            this.props.user == null ? null : (
              <>
              <Nav className="navbar-nav-hover align-items-lg-center">
       <Navbar.Brand className="me-lg-3">
       <Button variant="danger" type="submit" className="w-100" onClick={this.logout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
                    &nbsp;&nbsp;
                    Log Out
                  </Button> 
                  </Navbar.Brand>
       </Nav>
              
              </>
            )
          }
     
    <Navbar.Toggle aria-controls="navbar-default-primary" />
  </Container>
</Navbar>
    );
  }
}
