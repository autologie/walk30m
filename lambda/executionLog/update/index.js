'use strict';
console.log('Loading function');

let aws = require('aws-sdk');
let dynamo = new aws.DynamoDB();

exports.handler = (event, context, callback) => {
	console.log(event);
	dynamo.updateItem({
		TableName: "execution_log",
		Key: {
			uuid: {
				S: event.uuid
			},
			start_datetime: {
				N: (+ new Date(event.payload.start_datetime)).toString()
			}
		},
		UpdateExpression: "set complete_datetime = :dt, result_path = :path",
		ExpressionAttributeValues: {
			":path": {
				L: event.payload.result_path.map((location) => {
				   return {
					   M: {
						 lat: { N: String(location.lat) },
						 lng: { N: String(location.lng) }
					  }
				   };
			   })
			},
			":dt": {
				N: (+new Date(event.payload.complete_datetime)).toString()
			}
		}
	}, (e) => {
		console.log(e);
		let error = !e || e.code === "ConditionalCheckFailedException" ? null : e;

		callback(error, "");
	});
};
