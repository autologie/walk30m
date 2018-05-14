const uuidv4 = require("uuid/v4");
const camelcaseKeys = require("camelcase-keys");
const Datastore = require("@google-cloud/datastore");
const Users = require("google-function-authorizer");

const datastore = new Datastore();
const kind = "ExecutionLog";
const timeZoneOffset = -9;

function hasName(name) {
  return entity => entity[datastore.KEY].path[1] === name;
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

function withCors(req, res) {
  return res
    .set("Access-Control-Allow-Origin", req.get("Origin"))
    .set("Access-Control-Allow-Headers", "Content-Type,User-Agent")
    .set("Access-Control-Allow-Methods", "GET,PUT,POST");
}

function handleNotFound(req, res) {
  console.warn("Requested resource not found.", req.path);
  withCors(req, res).sendStatus(404);
}

function handleBadRequest(req, res, message) {
  console.warn("Invalid request.", message);
  withCors(req, res).sendStatus(400);
}

function handleError(req, res, e) {
  console.error("An error occurred in handling request.", e);
  if (!res.headersSent) withCors(req, res).sendStatus(500);
}

function handleCreate(req, res) {
  if (typeof req.body !== "object")
    return handleBadRequest("Request body is empty or insane.");

  const body = camelcaseKeys(req.body);
  const id = uuidv4();

  return datastore
    .save({
      key: datastore.key([kind, id]),
      data: Object.assign({}, body, {
        startDateTime: new Date(body.startDatetime),
        userAgent: req.get("User-Agent"),
        clientIp: req.ip,
        origin: undefined,
        isInitial: undefined,
        startDatetime: undefined,
        viewport: undefined,
        originAddress: body.origin.address,
        originCoordinate: datastore.geoPoint({
          latitude: body.origin.lat,
          longitude: body.origin.lng
        }),
        viewportWidth: body.viewport.width,
        viewportHeight: body.viewport.height
      })
    })
    .then(() =>
      withCors(req, res)
        .status(201)
        .json({ uuid: id })
    )
    .catch(err => handleError(req, res, err));
}

function handleUpdate(req, res) {
  const pathComponents = req.path.split("/");
  const id = pathComponents[1];

  if (id === undefined || id === "")
    return handleBadRequest(req, res, "Request path is invalid.");

  if (typeof req.body !== "object")
    return handleBadRequest("Request body is empty or insane.");

  const datastoreKey = datastore.key([kind, id]);

  return datastore
    .get(datastoreKey)
    .then(([entity]) => {
      if (entity === undefined) return handleNotFound(req, res);

      if (entity.completeDateTime)
        return handleBadRequest(
          req,
          res,
          "Attempted to update an entity which has been completed."
        );

      return datastore
        .save({
          key: datastoreKey,
          data: Object.assign({}, entity, {
            completeDateTime: new Date(req.body.complete_datetime),
            path: (req.body.result_path || []).map(coord =>
              datastore.geoPoint({
                latitude: coord.lat,
                longitude: coord.lng
              })
            )
          })
        })
        .then(() => withCors(req, res).sendStatus(200));
    })
    .catch(err => handleError(req, res, err));
}

function handleQuery(req, res) {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  const day = parseInt(req.query.day, 10);

  if (!year || !month || !day) {
    handleBadRequest(req, res, "year, month and day is required.");
  } else {
    const query = datastore.createQuery(kind);

    query.filter(
      "startDateTime",
      ">=",
      new Date(year, month - 1, day, timeZoneOffset)
    );
    query.filter(
      "startDateTime",
      "<",
      new Date(year, month - 1, day + 1, timeZoneOffset)
    );

    datastore
      .runQuery(query)
      .then(([entities]) =>
        entities.map(entity =>
          Object.assign({}, entity, {
            id: entity[datastore.KEY].path[1]
          })
        )
      )
      .then(body => withCors(req, res).json(body))
      .catch(e => handleError(req, res, e));
  }
}

exports.executionLogs = (req, res) => {
  try {
    if (req.method === "OPTIONS") withCors(req, res).sendStatus(200);
    else if (req.method === "POST") handleCreate(req, res);
    else if (req.method === "PUT") handleUpdate(req, res);
    else if (req.method === "GET")
      withUsers(req, users => users.authorize(req, res, handleQuery));
    else handleNotFound(req, res);
  } catch (e) {
    handleError(req, res, e);
  }
};
