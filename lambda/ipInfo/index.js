var config = require("./config");
var _ = require("lodash");
var https = require("https");

_.templateSettings = { interpolate: /\{\{(.+?)\}\}/ };

function handleRequest(req, context, callback) {
	var rpcReq,
		cfg = config.ipInfoDB,
		clientIp = req.sourceIp,
		serviceUrl = _.template('{{url}}/ip-city/?key={{key}}&ip={{ip}}&format=json')(_.defaults(cfg, {
			ip: clientIp
		}));

	function sendResponse(body) {
		callback(null, body);
	}

	if (!clientIp) {
		console.log('no client ip provided, sending fallback response...');
		sendResponse(cfg.fallbackResponse);

	} else {
		rpcReq = https.get(serviceUrl, function(rpcRes) {
			var data = [];

			rpcRes.on('data', function(d) {
				data.push(d);
			});
			rpcRes.on('end', function() {
				data = JSON.parse(data.join(''));
				sendResponse({
					lat: data.latitude,
					lng: data.longitude
				});
			});
		});

		rpcReq.setTimeout(cfg.timeout, function() {
			console.log('no response in ' + cfg.timeout + ' milliseconds.');
			sendResponse(cfg.fallbackResponse);
		});

		rpcReq.on('error', function(err) {
			console.log(err);
			sendResponse(cfg.fallbackResponse);
		});
	}
}

exports.handler = handleRequest;

