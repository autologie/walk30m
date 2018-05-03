const uuidv4 = require("uuid/v4");
const camelcaseKeys = require("camelcase-keys");
const Datastore = require("@google-cloud/datastore");

const datastore = new Datastore();

function withCors(res) {
  return res
    .set("Access-Control-Allow-Origin", "*")
    .set("Access-Control-Allow-Headers", "Content-Type,User-Agent")
    .set("Access-Control-Allow-Methods", "GET,PUT,POST");
}

function handleNotFound(req, res) {
  console.warn("Requested resource not found.", req.path);
  return withCors(res)
    .status(404)
    .end();
}

function handleBadRequest(req, res, message) {
  console.warn("Invalid request.", message);
  return withCors(res)
    .status(400)
    .end();
}

function handleError(req, res, e) {
  console.error("An error occurred in handling request.", e);
  return withCors(res)
    .status(500)
    .end();
}

function handleCreate(req, res) {
  if (typeof req.body !== "object")
    return handleBadRequest("Request body is empty or insane.");

  const body = camelcaseKeys(req.body);
  const id = uuidv4();

  datastore.save(
    {
      key: datastore.key(["ExecutionLog", id]),
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
    },
    err => {
      if (err) return handleError(req, res, err);

      withCors(res)
        .status(201)
        .end(JSON.stringify({ uuid: id }));
    }
  );
}

function handleUpdate(req, res) {
  const pathComponents = req.path.split("/");
  const id = pathComponents[1];

  if (id === undefined || id === "")
    return handleBadRequest(req, res, "Request path is invalid.");

  if (typeof req.body !== "object")
    return handleBadRequest("Request body is empty or insane.");

  const datastoreKey = datastore.key(["ExecutionLog", id]);

  datastore.get(datastoreKey, (err, entity) => {
    if (err) return handleError(req, res, err);

    if (entity === undefined) return handleNotFound(req, res);

    if (entity.completeDateTime)
      return handleBadRequest(
        req,
        res,
        "Attempted to update an entity which has been completed."
      );

    const body = camelcaseKeys(req.body);

    datastore.save(
      {
        key: datastoreKey,
        data: Object.assign({}, entity, {
          completeDateTime: new Date(body.completeDatetime),
          path: (body.resultPath || []).map(coord =>
            datastore.geoPoint({
              latitude: coord.lat,
              longitude: coord.lng
            })
          )
        })
      },
      err => {
        if (err) return handleError(req, res, err);

        withCors(res)
          .status(200)
          .end();
      }
    );
  });
}

exports.executionLogs = (req, res) => {
  try {
    if (req.method === "OPTIONS") return withCors(res).status(200).end();
    if (req.method === "POST") return handleCreate(req, res);
    if (req.method === "PUT") return handleUpdate(req, res);
    return handleNotFound(req, res);
  } catch (e) {
    handleError(req, res, e);
  }
};
