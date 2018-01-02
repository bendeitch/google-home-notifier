var config = require('config');
var express = require('express');
var googlehomefinder = require('google-home-notifier/google-home-finder');
var googlehome = require('google-home-notifier');
var bodyParser = require('body-parser');
var app = express();

var language = config.get('language');
var serverPort = config.get('serverPort');
var devices = config.get('devices');

console.log('Configured with language "%s", serverPort %d, devices: %s', language, serverPort, devices);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

googlehomefinder.start();

var getAddresses = function() {
  var addresses = googlehomefinder.addresses;
  return devices.map( name => addresses[name] );
}

app.post('/google-home-notifier', urlencodedParser, function (req, res) {
  
  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  
  var text = req.body.text;

  if (text){
    try {
      if (text.startsWith('http')){
        var mp3_url = text;
        googlehome.play(mp3_url, getAddresses(), function(notifyRes) {
          console.log(notifyRes);
        });
	res.sendStatus(200);
      } else {
        googlehome.notify(text, getAddresses(), language, function(notifyRes) {
          console.log(notifyRes);
        });
	res.sendStatus(200);
      }
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.send('Missing text parameter');
  }
})

app.listen(serverPort);

