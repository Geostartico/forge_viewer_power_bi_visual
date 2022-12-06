/**
 * used as a server for the visual
 * the visual itself can't act as a server as it runs solely on the browser
 * therefore this script running localy is needed
 * **/
const express = require("express");
const http = require('http')
const https = require('https')
const crypto = require('crypto-js');
const fs = require('fs')
const axios = require("axios");
//https requires an ssl certificate and domain
const httpsOptions = {
    key: fs.readFileSync("<key-path>"),
    cert: fs.readFileSync("<certificate-path"),
    passphrase: '<passphrase>'
};
//the application is created using the express.js api
const app = express();
const cors = require("cors");
const {Mutex} = require("async-mutex");

app.use(cors({credentials : true, origin : true}));
app.use(express.json());
//main path
app.get('/', (req, res) => {
    res.send("HI")
})
//where the user is redirected in case of a successful authentication
app.get('/successfulAuth', (req, res) => {
    res.send("RETURN TO POWER BI")
})
//the path called when an authentication is completed and the access token is acquired
//available only if a /sendCredentials call was performed beforehand
app.get('/callback', async (req, res) =>{
    if(!this.mut === undefined){
        this.mut = new Mutex();
    }
    await this.mut.acquire()
    if(!this.creds_to_access_token){
        this.creds_to_access_token = new Map();
    }
    console.log(req.query.code);
    //doing the request to acquire the access token
    console.log("request", req);
    var jason = {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: 'https://localhost:4222/callback'
    }
    var paramsBody = [];
    for (var key in jason) {
        if (jason.hasOwnProperty(key)) {
            paramsBody.push(key + '=' + jason[key]);
        }
    }
    //console.log(JSON.stringify(jason));
    console.log(this.client_id, this.client_secret);
    console.log(crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(this.client_id + ':' + this.client_secret)));
    //actual request
    axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v2/token',
        headers: {
            'Authorization': 'Basic ' + crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(this.client_id + ':' + this.client_secret)),
			'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: paramsBody.join('&')
    })
        .then((fetchres) => {
            fetchres.data.client_secret = this.client_secret.slice();
            console.log(fetchres.data);
            this.creds_to_access_token.set(this.client_id.slice(), fetchres.data);
            res.redirect("https://localhost:4222/successfulAuth");
            res.status(200);
            this.client_id = undefined;
            this.client_secret = undefined;
            this.mut.release();

        })
        .catch((err) => {
            this.mut.release(); 
            console.log(err)
        });
})
//path used to get the token
//in the headers client_id and client_secret must be provided
app.get('/getToken', async (req, res) => {
    if(!this.creds_to_access_token){
        this.creds_to_access_token = new Map();
    }
    if(this.mut === undefined){
        this.mut = new Mutex();
    }
    await this.mut.acquire();
    console.log("getting token");
    //reading the headers
    var client_id = req.get("client_id");
    var client_secret = req.get("client_secret");
    //something in the credentials was wrong
    if(client_id == undefined
        || !this.creds_to_access_token.has(client_id)
        || this.creds_to_access_token.get(client_id).client_secret != client_secret){
        res.status(404);
        res.send("ERRROR, no response available" + await JSON.stringify(this.codeResponse))
        this.mut.release();
        return;
    }
    //the Token was found in the saved ones and is returned
    res.status(200)
    res.send(this.creds_to_access_token.get(client_id));
    console.log(this.creds_to_access_token.get(client_id));
    this.mut.release();
})
//The server has to know to what client_id and client_secret it has to associate the token to
app.post('/sendCredentials', (req, res) => {
    console.log(req.body);
    if(!req.body.client_id || !req.body.client_secret){
        res.status(402)
        res.send("credentials not given")
        return
    }
    //credentials saved for the next authentication
    this.client_id = req.body.client_id;
    this.client_secret = req.body.client_secret;
    res.status(200)
    res.send("credentials taken")
})

//app created with https as some browsers might require it
https.createServer(httpsOptions, app).listen(4222, function() {
    console.log('Express HTTPS server listening on port ' + 4222);
});
