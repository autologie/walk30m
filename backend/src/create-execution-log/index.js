const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore();

function withCors(res) {
  return res
    .set('Access-Control-Allow-Origin', '*')
    .set('Access-Control-Allow-Methods', 'POST');
}

exports.createExecutionLog = (req, res) => {
  withCors(res).status(201).end();
};
