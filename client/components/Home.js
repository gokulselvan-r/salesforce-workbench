import axios from 'axios';
import React from 'react';

import Login from './Login.js';
import Main from './Main.js';
import NavBar from './Navbar.js';
export default class Home extends React.Component {
  state = {
    user: null
  };
  componentDidMount() {
    // Get logged in user
    fetch('/auth/whoami', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          axios
            .post('/user-data', json, {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
              }
            })
            .then((res) => {
              var user = { ...json, ...res.data };
              this.setState({ user });
            });
        });
      } else if (response.status !== 401) {
        // Ignore 'unauthorized' responses before logging in
        console.error('Failed to retrieve logged user.', JSON.stringify(response));
      }
    });
  }
  handleQueryExecution = (data) => {
    // Send SOQL query to server
    const queryUrl = '/query?q=' + encodeURI(data.query);
    fetch(queryUrl, {
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    }).then((response) => {
      response.json().then((json) => {
        if (response.ok) {
          this.setState({ result: JSON.stringify(json, null, 2) });
        } else {
          this.setState({
            result: 'Failed to retrieve query result.'
          });
        }
      });
    });
  };

  render() {
    return (
      <div>
        <NavBar user = {this.state.user} />
        {this.state.user == null ? (
          <Login />
        ) : (
          <div className="slds-m-around--xx-large">
            <Main user={this.state.user} onExecuteQuery={this.handleQueryExecution} />
          </div>
        )}
      </div>
    );
  }
}
