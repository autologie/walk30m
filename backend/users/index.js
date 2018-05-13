const Datastore = require("@google-cloud/datastore");
const Users = require("google-function-authorizer");

const datastore = new Datastore();

function handleError(req, res, e) {
  console.error("An error occurred in handling request.", e);
  if (!res.headersSent) withCors(res).sendStatus(500);
}

function withUsers(callback) {
  return datastore
    .get(datastore.key(['Miscellaneous', 'secret']))
    .then(([secret]) => callback(Users({
      session: {
        secret: secret.value,
      },
      datastore: {
        kind: 'User',
        namespace: undefined,
      },
    })));
}

exports.users = (req, res) =>
  withUsers(users => users.handle(req, res))
    .catch(err => handleError(req, res, err));
