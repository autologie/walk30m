const uuidv4 = require("uuid/v4");
const camelcaseKeys = require("camelcase-keys");
const Datastore = require("@google-cloud/datastore");
const datastore = new Datastore();

function withCors(res) {
  return res
    .set("Access-Control-Allow-Origin", "*")
    .set("Access-Control-Allow-Methods", "POST");
}

exports.createExecutionLog = (req, res) => {
  if (typeof req.body !== "object") {
    console.warn(
      "Invalid request. request body is missing or insane.",
      JSON.stringify(req.body)
    );
    res.status(400).end();
    return;
  }

  const body = camelcaseKeys(req.body);
  const id = uuidv4();
  const data = Object.assign({}, body, {
    test: true,
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
        namespace: "develop",
        path: ["ExecutionLog", id]
      }),
      data
    },
    err => {
      if (err) {
        console.error(
          "Failed to create a datastore entity.",
          JSON.stringify(err),
          JSON.stringify(data)
        );
        withCors(res)
          .status(500)
          .end();
      } else {
        withCors(res)
          .status(201)
          .end(JSON.stringify({ uuid: id }));
      }
    }
  );
};
