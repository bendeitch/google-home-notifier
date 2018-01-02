var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var addresses = new Map();

var start = function() {
  browser.start();
  browser.on('serviceUp', function(service) {
    var fullName = service.txtRecord.fn
    var address = service.addresses[0];
    console.log('Device "%s" at %s', fullName, address);
    addresses[fullName]=address;
  });
}

var stop = function() {
  browser.stop();
}

exports.start = start;
exports.stop = stop;
exports.addresses = addresses;
