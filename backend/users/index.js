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
    .then(([secret]) => {
      const users = Users({
        session: {
          secret: secret.value,
        },
        datastore: {
          kind: 'User',
          namespace: undefined,
        },
      });

      callback(users);
    });
}

exports.users = (req, res) => {
  console.log(req.params);
  withUsers(users => users.handle(req, res))
    .catch(err => handleError(req, res, err));
};
