var config = require("./config");
var _ = require("lodash");
var https = require("https");

_.templateSettings = { interpolate: /\{\{(.+?)\}\}/ };

function getFallback() {
	var responses = config.ipInfoDB.fallbackResponses;

	return responses[Math.floor(Math.random() * responses.length)];
}

function handleRequest(req, context, callback) {
	var rpcReq,
		cfg = config.ipInfoDB,
		clientIp = req.sourceIp,
		serviceUrl = _.template('{{url}}/ip-city/?key={{key}}&ip={{ip}}&format=json')(_.defaults(cfg, {
			ip: clientIp
		}));

	function sendResponse(body) {
		callback(null, body || getFallback());
	}

	if (!clientIp) {
		console.log('no client ip provided, sending fallback response...');
		sendResponse();

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
			rpcReq.abort();
		});

		rpcReq.on('error', function(err) {
			console.log(err);
			sendResponse();
		});
	}
}

exports.handler = handleRequest;

