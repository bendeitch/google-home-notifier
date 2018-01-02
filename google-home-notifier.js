var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var googletts = require('google-tts-api');

function GoogleHomeNotifier(deviceAddresses, language) {
  this.deviceAddresses = deviceAddresses;
  this.language = language;
}

GoogleHomeNotifier.prototype.notify = function(message, callback) {
  getSpeechUrl(message, this.deviceAddresses, this.language, function(res) {
    callback(res);
  });
};

GoogleHomeNotifier.prototype.play = function(mp3_url, callback) {
  getPlayUrl(mp3_url, this.deviceAddresses, function(res) {
    callback(res);
  });
};

var getSpeechUrl = function(text, hosts, language, callback) {
  googletts(text, language, 1).then(function (url) {
    hosts.forEach(function(host) {
      onDeviceUp(host, url, function(res){
        callback(res)
      });
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
};

var getPlayUrl = function(url, hosts, callback) {
  hosts.forEach(function(host) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
  });
};

var onDeviceUp = function(host, url, callback) {
  var client = new Client();
  client.connect(host, function() {
    client.launch(DefaultMediaReceiver, function(err, player) {

      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'LIVE' // BUFFERED or LIVE
      };
      player.load(media, { autoplay: true }, function(err, status) {
        client.close();
	callback(err);
      });
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback(err);
  });
};

module.exports = GoogleHomeNotifier;
