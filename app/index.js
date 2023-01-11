// 3rd party dependencies
const path = require('path'),
  express = require('express'),
  session = require('cookie-session'),
	https = require('https'),
	fs = require('fs'),
	axios = require('axios'),
  qs = require('qs'),
	nJwt = require('njwt'),
  cors = require('cors'),
  jsforce = require('jsforce');
const { userData } = require('../sampleData');

// Load and check config
require('dotenv').config();
if (!(process.env.loginUrl && process.env.consumerKey && process.env.consumerSecret && process.env.callbackUrl && process.env.apiVersion && process.env.sessionSecretKey)) {
  console.error('Cannot start app: missing mandatory configuration. Check your .env file.');
  process.exit(-1);
}

// Instantiate Salesforce client with .env configuration
const oauth2 = new jsforce.OAuth2({
  loginUrl: process.env.loginUrl,
  clientId: process.env.consumerKey,
  clientSecret: process.env.consumerSecret,
  redirectUri: process.env.callbackUrl
});

// Setup HTTP server
const app = express();
const port = process.env.PORT || 8080;
app.set('port', port);
app.set('trust proxy', 1);

// Enable server-side sessions
app.use(
  session({
    secret: process.env.sessionSecretKey,
    cookie: { secure: process.env.isHttps === 'true' },
    resave: false,
    saveUninitialized: false
  })
);
app.use(cors());
// Serve HTML pages under root directory
app.use('/', express.static(path.join(__dirname, '../public/')));

/**
 *  Attemps to retrieves the server session.
 *  If there is no session, redirects with HTTP 401 and an error message
 */
function getSession(request, response) {
  const session = request.session;
  if (!session.sfdcAuth) {
    response.status(401).send('No active session');
    return null;
  }
  return session;
}

function resumeSalesforceConnection(session) {
  return new jsforce.Connection({
    instanceUrl: session.sfdcAuth.instanceUrl,
    accessToken: session.sfdcAuth.accessToken,
    version: process.env.apiVersion
  });
}


function getJWTSignedToken_nJWTLib(sfdcUserName) {
	var claims = {
		iss: process.env.consumerKey,
		sub: sfdcUserName,
		aud: process.env.domain,
		exp: (Math.floor(Date.now() / 1000) + (60 * 3))
	}

	return encryptUsingPrivateKey_nJWTLib(claims);
}

function encryptUsingPrivateKey_nJWTLib(claims) {
	var absolutePath = path.resolve(__dirname, "private-key.pem");
	var cert = fs.readFileSync(absolutePath);
	var jwt_token = nJwt.create(claims, cert, 'RS256');
	var jwt_token_b64 = jwt_token.compact();
	return jwt_token_b64;
};



/**
 * Login endpoint
 */
app.get('/auth/login', (request, response) => {
  // Redirect to Salesforce login/authorization page
  response.redirect(oauth2.getAuthorizationUrl({}));
});

/**
 * Login callback endpoint (only called by Salesforce)
 */
app.get('/auth/callback', (request, response) => {
  if (!request.query.code) {
    response.status(500).send('Failed to get authorization code from server callback.');
    return;
  }

  // Authenticate with OAuth
  const conn = new jsforce.Connection({
    oauth2: oauth2,
    version: process.env.apiVersion
  });
  conn.authorize(request.query.code, (error, userInfo) => {
    if (error) {
      console.log('Salesforce authorization error: ' + JSON.stringify(error));
      response.status(500).json(error);
      return;
    }

    // Store oauth session data in server (never expose it directly to client)
    request.session.sfdcAuth = {
      instanceUrl: conn.instanceUrl,
      accessToken: conn.accessToken
    };
    // Redirect to app main page
    return response.redirect('/');
  });
});

/**
 * Logout endpoint
 */
app.get('/auth/logout', (request, response) => {
  var session = getSession(request, response);
  if (session == null) return;

  // Revoke OAuth token
  const conn = resumeSalesforceConnection(session);
  conn.logout((error) => {
    if (error) {
      console.error('Salesforce OAuth revoke error: ' + JSON.stringify(error));
      response.status(500).json(error);
      return;
    }

    // Destroy server-side session
    // session.= null((error) => {
    //   if (error) {
    //     console.error('Salesforce session destruction error: ' + JSON.stringify(error));
    //   }
    // });
    session = null
    // Redirect to app main page
    return response.redirect('/');
  });
});

/**
 * Endpoint for retrieving currently connected user
 */
app.get('/auth/whoami', (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }

  // Request session info from Salesforce
  const conn = resumeSalesforceConnection(session);
  conn.identity((error, res) => {
    response.send(res);
  });
});

/**
 * Endpoint for performing a SOQL query on Salesforce
 */
app.get('/query', (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }

  const query = request.query.q;
  if (!query) {
    response.status(400).send('Missing query parameter.');
    return;
  }

  const conn = resumeSalesforceConnection(session);
  conn.query(query, (error, result) => {
    if (error) {
      console.error('Salesforce data API error: ' + JSON.stringify(error));
      response.status(500).json(error);
      return;
    } else {
      response.send(result);
      return;
    }
  });
});


app.post('/user-data', express.json(), async (req, res) => {
	var data = req.body
	var sfUserName = data.username;
	var token = getJWTSignedToken_nJWTLib(sfUserName);

	var data = qs.stringify({
		'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
		'assertion': token
	});
	var config = {
		method: 'post',
		url: `${process.env.domain}/services/oauth2/token`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		data: data
	};
	axios(config)
		.then(function (response) {
      res.send(response.data)
		})
		.catch(function (error) {
			console.log(error.response.data);
			res.send(false)
		});
})


app.get('/healthz', express.json(), async (req, res) => {
	res.status(200).send(true)
})

app.get('/get-data', express.json(), async (req, res) => {
	res.json(userData)
})

app.post('/get-objects', express.json(), async (req, res) => {
	var { instance_url, access_token } = req.body
  axios.get(`${instance_url}/services/data/${process.env.apiVersion}/sobjects/`, {
    headers:{
      'Authorization' : `Bearer ${access_token}`
    }
  }).then(objects => {
    var sf_objects = objects.data.sobjects.map(object => object.label)
    sf_objects = [...new Set(sf_objects)];

    res.json(sf_objects.sort())
  })
})

app.post('/get', express.json(), async (req, res) => {
  var { instance_url, access_token, object, id } = req.body
  var url = `${instance_url}/services/data/${process.env.apiVersion}/sobjects/${id ? object+'/'+id : object}` 
  axios.get(url, {
    headers:{
      'Authorization' : `Bearer ${access_token}`
    }
  }).then(objects => {
    res.json(objects.data)
  }).catch(err=>{
    res.json(err.response.data)
  })
})

app.post('/post', express.json(), async (req, res) => {
  var { instance_url, access_token, object, data } = req.body;
  axios
    .post(`${instance_url}/services/data/${process.env.apiVersion}/sobjects/${object}`, data, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    })
    .then((objectData) => {
      console.log(`${object} Created`)
      res.json(objectData.data);
    })
    .catch((err) => {
      if (err.response.data[0]['errorCode'] === 'DUPLICATES_DETECTED') {
        axios
          .patch(`${instance_url}/services/data/${process.env.apiVersion}/sobjects/${object}/${err.response.data[0]['duplicateResut']['matchResults'][0]['matchRecords'][0]['record']['Id']}`, data, {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            }
          })
          .then((objectData) => {
            console.log(`${object} Not Created. But Updated`)
            res.json(objectData.data);
          })
          .catch((err) => {
            console.log(`${object} Neither Created Not Updated`)
            res.json(err.response.data);
          });
      } else {
        res.json(err.response.data);
      }
    });

});

app.post('/patch', express.json(), async (req, res) => {
  var { instance_url, access_token, object, data, id } = req.body
  if (id) {
    axios
          .patch(`${instance_url}/services/data/${process.env.apiVersion}/sobjects/${object}/${id}`, data, {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            }
          })
          .then((objectData) => {
            console.log(`${object} Updated`)
            res.json({
              "success": true,
              "errors": []
            });
          })
          .catch((err) => {
            console.log(`${object} Neither Created Not Updated`)
            res.json(err.response.data);
          });
  } else {
    res.json({
      "type" : "Missing id",
      "error" : "Object ID is mandatory to Update."
    });
  }
  
})



// app.listen(app.get('port'), () => {
//   console.log('Server started: http://localhost:' + app.get('port') + '/');
// });

var options = {
	key: fs.readFileSync(`${__dirname}/private-key.pem`, 'utf8'),
	cert: fs.readFileSync(`${__dirname}/cert.pem`, 'utf8')
};
const PORT = process.env.PORT || 5000
// https.createServer(options, app).listen(PORT, () => { console.log(`Server started at port ${PORT}`) });

app.listen(PORT, () => {console.log(`Server started at port ${PORT}`)})