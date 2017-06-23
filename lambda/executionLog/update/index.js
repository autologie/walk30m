'use strict';
console.log('Loading function');

let aws = require('aws-sdk');
let dynamo = new aws.DynamoDB();

exports.handler = (event, context, callback) => {
  let startDate = new Date(event.payload.start_datetime);
  let y = `${startDate.getFullYear()}`;
  let m = `${startDate.getMonth() + 1}`;
  let d = `${startDate.getDate()}`;

  if (m.length === 1) m = "0" + m;
  if (d.length === 1) d = "0" + d;

  console.log(event);

  dynamo.updateItem({
    TableName: "directions_api_call",
    Key: {
      ymd: {
        S: `${y}${m}${d}`
      }
    },
    AttributeUpdates: _.mapValues(event.api_call_stats).map(count => ({
      Action: 'ADD',
      Value: {
        N: count
      }
    }))
  });

  dynamo.updateItem({
    TableName: "execution_log",
    Key: {
      uuid: {
        S: event.uuid
      },
      start_datetime: {
        N: (+startDate).toString()
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
