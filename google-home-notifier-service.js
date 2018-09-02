var config = require('config');
var express = require('express');
var googlehomefinder = require('./google-home-finder');
var googlehome = require('./google-home-notifier');
var bodyParser = require('body-parser');
var app = express();

var language = config.get('language');
var accent = config.get('accent');
var serverPort = config.get('serverPort');
var devices = config.get('devices');

console.log('Configured with language "%s", accent "%s", serverPort %d, devices: %s', language, accent, serverPort, devices);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

googlehomefinder.start();

var getAllAddresses = function() {
  var addresses = googlehomefinder.addresses;
  return devices.map( name => addresses[name] );
}

var getAddress = function(deviceName) {
  return [googlehomefinder.addresses[deviceName]];
}

var processText = function(text, deviceAddresses) {

  if (text.startsWith('http')) {
    var mp3_url = text;
    googlehome.play(mp3_url, deviceAddresses, function(notifyRes) {
      if (notifyRes != 'OK') {
        console.log(notifyRes);
      }
    });

  } else {

    googlehome.notify(text, deviceAddresses, language, accent, function(notifyRes) {
      if (notifyRes != 'OK') {
        console.log(notifyRes);
      }
    });

  }
}

var processRequest = function(req, res, deviceName) {

  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  
  var text = req.body.text;

  if (text){

    try {

      if (deviceName) {
        processText(text, getAddress(deviceName));
      } else {
        processText(text, getAllAddresses());
      }
      res.sendStatus(200);

    } catch(err) {

      console.log(err);
      res.status(500).send(err);

    }

  } else {

    res.status(500).send('Missing text parameter');
  }
}

app.post('/google-home-notifier/:deviceName', urlencodedParser, function (req, res) {
  processRequest(req, res, req.params.deviceName);
})

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
  processRequest(req, res, null);
})

app.listen(serverPort);

