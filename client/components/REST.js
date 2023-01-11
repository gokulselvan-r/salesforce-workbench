import React from "react";
import {
  Col,
  Row,
  Card,
  Form,
  Modal,
  Button,
  InputGroup,
} from "@themesberg/react-bootstrap";
import axios from "axios";
import Dropdown from "react-dropdown";
// import "react-dropdown/style.css";
import { faLessThanEqual } from "@fortawesome/free-solid-svg-icons";

export default class REST extends React.Component {
  state = {
    method: "get",
    object: "Contact",
    objects: [],
    Id: "",
    jsonData: "",
    showModel: false
  };

  
  componentDidMount() {
    var { instance_url, access_token } = this.props.user;
    axios
      .post(
        `/get-objects`,
        {
          instance_url,
          access_token,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((objects) => {
        this.setState({
          objects: objects.data,
        });
      });
  }
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
  handleObject = (e) => {
    this.setState({
      object: e.value,
    });
  };
  handleSubmit = (e) => {
    e.preventDefault();
    var data = {};
    var { instance_url, access_token } = this.props.user;
    if (this.state.method === "get" && this.state.object) {
      data["object"] = this.state.object;
      data["id"] = this.state.Id;
      data = { ...data, instance_url, access_token };
      axios
        .post(`/get`, data, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((objects) => {
          this.setState({
            result : JSON.stringify(objects.data, null, 2) 
          })
        });
    } else if (this.state.method === "post" && this.state.jsonData && this.state.object) {
      data["object"] = this.state.object;
      data["data"] = this.state.jsonData;
      data = { ...data, instance_url, access_token };
      axios
        .post(`/post`, data, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((objects) => {
         this.setState({
           result : JSON.stringify(objects.data, null, 2) 
         })
        });
    } else if (this.state.method === "patch" && this.state.jsonData && this.state.Id && this.state.object) {
      data["object"] = this.state.object;
      data["data"] = this.state.jsonData;
      data["id"] = this.state.Id;
      data = { ...data, instance_url, access_token };
      axios
        .post(`/patch`, data, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((objects) => {
          this.setState({
            result : JSON.stringify(objects.data, null, 2) 
          })
        });
    } else {
      this.setState({
        showModel: true
      })
    }
  };
  render() {
    return (
      <>
      <Col xs={12} className="d-flex align-items-center justify-content-center">
        <Modal as={Modal.Dialog} centered show={this.state.showModel} onHide={() => this.setState({
    showModel: faLessThanEqual
  })}>
    <Modal.Header>
      <Modal.Title className="h6">Warning</Modal.Title>
      <Button variant="close" aria-label="Close" onClick={() => this.setState({
    showModel: false
  })} />
    </Modal.Header>
    <Modal.Body>
      <p>We Can't able to process the request. Please check if you fill all required details.</p>
      <p>If you have any queries related to Salesforce REST API, please check <a href="https://gokulselvanr.web.app/">here</a>.</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => this.setState({
    showModel: false
  })}>
        I Got It
    </Button>
      <Button variant="link" className="text-gray ms-auto" onClick={() => this.setState({
    showModel: false
  })}>
        Close
    </Button>
    </Modal.Footer>
  </Modal>
        <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100">
          <div className="text-center text-md-center mb-4 mt-md-0"></div>
          <Card border="light" className="bg-white shadow-sm mb-4">
            <Card.Body>
              <Form>
                <Row>
                  <Col
                    sm={10}
                    style={{ textAlign: "center", margin: "auto" }}
                    className="mb-3"
                  >
                    <InputGroup>
                      <Form.Control
                        style={{ textAlign: "center", margin: "auto" }}
                        type="text"
                        value="BASE URL - https://gandscom-dev-ed.my.salesforce.com/services/data/v53.0/sobjects"
                        disabled
                        placeholder="BASE URL"
                      />
                    </InputGroup>
                  </Col>
                </Row>
                <Row style={{ margin: "auto" }}>
                  <Col sm={1} className="mb-3"></Col>
                  <Col sm={3} className="mb-3">
                    <Form.Group className="mb-2">
                      <Form.Select
                        id="state"
                        defaultValue="get"
                        name="method"
                        onChange={this.handleChange}
                      >
                        <option value="get">GET</option>
                        <option value="post">POST</option>
                        <option value="patch">PATCH</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col sm={4}>
                    <Form.Group className="mb-2">
                      <Dropdown
                        className="drop-objects"
                        options={this.state.objects}
                        onChange={this.handleObject}
                        value={this.state.object}
                        placeholder="Select An Object"
                      />
                    </Form.Group>
                  </Col>

                  <Col sm={3}>
                    <InputGroup>
                      <Form.Control
                        style={{ textAlign: "center", margin: "auto" }}
                        type="text"
                        placeholder="Id (Optional)"
                        name="Id"
                        onChange={this.handleChange}
                      />
                    </InputGroup>
                  </Col>
                  <Col sm={1} className="mb-3"></Col>
                </Row>
                {this.state.method !== "get" ? (
                  <Row>
                    <Col
                      sm={12}
                      style={{ textAlign: "center", margin: "auto" }}
                      className="mb-3"
                    >
                      <Form.Group>
                        <Form.Control
                          placeholder="Json Data"
                          as="textarea"
                          name="jsonData"
                          value={this.state.jsonData}
                          rows="5"
                          onChange={this.handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                ) : (
                  <></>
                )}
                <div className="mt-3" style={{ textAlign: "right" }}>
                  <Button
                    variant="primary"
                    type="submit"
                    onClick={this.handleSubmit}
                  >
                    Execute
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          {
      this.state.result ? 
      <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <pre>{this.state.result}</pre>
      </Card.Body>
    </Card>
    :<></>
    }
        </div>
      </Col>
      </>
    );
  }
}
