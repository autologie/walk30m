const Datastore = require("@google-cloud/datastore");
const Users = require("google-function-authorizer");

const datastore = new Datastore();

function hasName(name) {
  return entity => entity[datastore.KEY].path[1] === name;
}

function withCors(req, res) {
  return res
    .set("Access-Control-Allow-Origin", req.get("Origin"))
    .set("Access-Control-Allow-Headers", "Content-Type,User-Agent")
    .set("Access-Control-Allow-Methods", "GET,PUT,POST");
}

function withUsers(req, callback) {
  return datastore
    .get(datastore.key(["Miscellaneous", "secret"]))
    .then(entities => {
      const secret = entities.filter(hasName("secret"))[0];

      if (!secret) {
        throw new Error("Invalid configuration. secret is missing.");
      }

      callback(
        Users({
          session: {
            secret: secret.value
          },
          cors: {
            "Access-Control-Allow-Origin": req.get("Origin"),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type,User-Agent",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE"
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

function handleError(req, res, e) {
  console.error("An error occurred in handling request.", e);
  if (!res.headersSent) res.sendStatus(500);
}

function handleSelf(req, res, user) {
  withCors(req, res).json({
    code: "OK",
    user,
  });
}

exports.users = (req, res) =>
  withUsers(req, users => {
    if (req.path === "/self" && req.method === "GET")
      users.authorize(req, res, handleSelf);
    else users.handle(req, res);
  }).catch(err => handleError(req, res, err));
