import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Form, Button, Container } from '@themesberg/react-bootstrap';
import { AboutMe } from './AboutMe';

class Login extends Component {
  login = (e) => {
    e.preventDefault();
    window.location = '/auth/login';
  };

  render() {
    return (
      <main>
        <section className="d-flex align-items-center">
          <Container>
            <Row
              className="justify-content-center form-bg-image"
              style={{
                backgroundImage: `url(https://${window.location.host}/images/signin.svg)`
              }}
            >
              <Col xs={12} className="d-flex align-items-center justify-content-center">
                <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <AboutMe />
                  <Form onSubmit={this.login} className="mt-4" role="form">
                    <Button variant="primary" type="submit" className="w-100" onClick={this.login}>
                      <FontAwesomeIcon icon={faCloud} />
                      &nbsp;&nbsp; Sign in With Salesforce
                    </Button>
                  </Form>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    );
  }
}

export default Login;
