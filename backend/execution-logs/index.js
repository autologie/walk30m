const uuidv4 = require("uuid/v4");
const camelcaseKeys = require("camelcase-keys");
const Datastore = require("@google-cloud/datastore");

const datastore = new Datastore();
const kind = "ExecutionLog";

function withCors(res) {
  return res
    .set("Access-Control-Allow-Origin", "*")
    .set("Access-Control-Allow-Headers", "Content-Type,User-Agent")
    .set("Access-Control-Allow-Methods", "GET,PUT,POST");
}

function handleNotFound(req, res) {
  console.warn("Requested resource not found.", req.path);
  withCors(res).sendStatus(404);
}

function handleBadRequest(req, res, message) {
  console.warn("Invalid request.", message);
  withCors(res).sendStatus(400);
}

function handleError(req, res, e) {
  console.error("An error occurred in handling request.", e);
  if (!res.headersSent) withCors(res).sendStatus(500);
}

function handleCreate(req, res) {
  if (typeof req.body !== "object")
    return handleBadRequest("Request body is empty or insane.");

  const body = camelcaseKeys(req.body);
  const id = uuidv4();

  datastore
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
      withCors(res)
        .status(201)
        .end(JSON.stringify({ uuid: id }))
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

  datastore
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
        .then(() => withCors(res).sendStatus(200));
    })
    .catch(err => handleError(req, res, err));
}

exports.executionLogs = (req, res) => {
  try {
    if (req.method === "OPTIONS") withCors(res).sendStatus(200);
    else if (req.method === "POST") handleCreate(req, res);
    else if (req.method === "PUT") handleUpdate(req, res);
    else handleNotFound(req, res);
  } catch (e) {
    handleError(req, res, e);
  }
};
