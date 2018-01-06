var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var googletts = require('google-tts-api');
var queue = require('queue');

var q = queue({concurrency: 1, autostart: true});

var notify = function(message, hosts, language, callback) {
  q.push(function(finished) {
    getSpeechUrl(message, hosts, language, function(res) {
      finished();
      callback(res);
    });
  });
}

var play = function(mp3_url, hosts, callback) {
  q.end();
  getPlayUrl(mp3_url, hosts, function(res) {
    callback(res);
  });
};


var getSpeechUrl = function(text, hosts, language, callback) {
  googletts(text, language, 1).then(function (url) {
    hosts.forEach(function (host) {
      onDeviceUp(host, url, function(res){
        callback(res);
      })
    })
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

      if (err) {

        console.log('Error: %s', err.message);
        client.close();
        callback(err);

      } else if (player) {

        var media = {
          contentId: url,
          contentType: 'audio/mp3',
          streamType: 'BUFFERED'
        };

        player.load(media, { autoplay: true }, function(err, status) {
          if (err != null) {
            client.close();
            callback(err);
          }
        });

        player.on('status', function(status) {
          if (status.playerState == 'IDLE' && status.idleReason == 'FINISHED') {
            client.close();
            callback('OK');
          }
        });
      }
  
  });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback(err);
  });
};

exports.play = play;
exports.notify = notify;
