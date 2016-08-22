'use strict';
console.log('Loading function');

let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();
let nodeUuid = require('node-uuid');

exports.handler = (event, context, callback) => {
	let uuid = nodeUuid.unparse(nodeUuid.v4(null, new Array(32), 0));

    dynamo.putItem({
		TableName: "execution_log",
		Item: Object.assign(event.payload, {
			uuid,
			start_datetime: +new Date(event.payload.start_datetime),
			user_agent: event.userAgent,
			client_ip: event.sourceIp
		})
	}, () => {
		let res = {uuid};
		console.log(res);
		callback(null, res);
	});
};
