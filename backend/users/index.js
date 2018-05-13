const Datastore = require("@google-cloud/datastore");
const Users = require("google-function-authorizer");

const datastore = new Datastore();

function handleError(req, res, e) {
  console.error("An error occurred in handling request.", e);
  if (!res.headersSent) res.sendStatus(500);
}

function hasName(name) {
  return entity => entity[datastore.KEY].path[1] === name;
}

function withUsers(callback) {
  return datastore
    .get([
      datastore.key(["Miscellaneous", "secret"]),
      datastore.key(["Miscellaneous", "allowedOrigins"])
    ])
    .then(([entities]) => {
      const secret = entities.filter(hasName("secret"))[0];
      const allowedOrigins = entities.filter(hasName("allowedOrigins"))[0];

      if (!secret) {
        throw new Error("Invalid configuration. secret is missing.");
      }

      if (!allowedOrigins) {
        throw new Error("Invalid configuration. allowedOrigins is missing.");
      }

      callback(
        Users({
          session: {
            secret: secret.value
          },
          cors: {
            "Access-Control-Allow-Origin": allowedOrigins.values.join(","),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type"
          },
          datastore: {
            kind: "User",
            namespace: undefined
          },
          rules: {
            create: false
          }
        })
      );
    });
}

exports.users = (req, res) =>
  withUsers(users => users.handle(req, res)).catch(err =>
    handleError(req, res, err)
  );
