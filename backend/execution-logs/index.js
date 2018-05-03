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
  const data = Object.assign({}, body, {
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
  });

  datastore.save(
    {
      key: datastore.key({
        path: ["ExecutionLog", id]
      }),
      data
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
  if (typeof req.body !== "object")
    return handleBadRequest("Request body is empty or insane.");

  const pathComponents = req.path.split("/");
  const id = pathComponents[1];

  if (id === undefined || id === "") {
    return handleBadRequest(req, res, "Request path is invalid.");
  }

  const datastoreKey = datastore.key({
    path: ["ExecutionLog", id]
  });

  datastore.get(datastoreKey, (err, entity) => {
    if (err) return handleError(req, res, err);

    if (entity === undefined) {
      res.status(404).end();
      return;
    }

    if (entity.completeDateTime) {
      console.warn("Attempted to update an entity which has been completed.");
      res.status(400).end();
      return;
    }

    const body = camelcaseKeys(req.body);
    const data = {
      completeDateTime: new Date(body.completeDatetime),
      path: (body.resultPath || []).map(coord =>
        datastore.geoPoint({
          latitude: coord.lat,
          longitude: coord.lng
        })
      )
    };

    datastore.save(
      {
        key: datastoreKey,
        data: Object.assign({}, entity, data)
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
    return withCors(res)
      .status(404)
      .end();
  } catch (e) {
    handleError(req, res, e);
  }
};
