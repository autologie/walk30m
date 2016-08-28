'use strict';
console.log('Loading function');

let aws = require('aws-sdk');
let sns = new aws.SNS();

exports.handler = (event, context, callback) => {
    sns.publish({
        Subject: "New message from walk30m user",
        Message: JSON.stringify(Object.assign(event.payload, {
			user_agent: event.userAgent,
			client_ip: event.sourceIp
        })),
        TopicArn: "%MESSAGE_TOPIC_ARN%"
    }, (e) => {
		console.log(e);
		callback(null, "");
	});
};
