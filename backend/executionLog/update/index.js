const camelcaseKeys = require("camelcase-keys");
const Datastore = require("@google-cloud/datastore");

const datastore = new Datastore();

function withCors(res) {
  return res
    .set("Access-Control-Allow-Origin", "*")
    .set("Access-Control-Allow-Methods", "PUT");
}

exports.updateExecutionLog = (req, res) => {
  if (typeof req.body !== "object") {
    console.warn(
      "Invalid request. request body is missing or insane.",
      JSON.stringify(req.body)
    );
    res.status(400).end();
    return;
  }

  const pathComponents = req.path.split("/");
  const id = pathComponents[1];

  if (id === undefined || id === "") {
    console.warn("Invalid request. request path is invalid.");
    res.status(400).end();
    return;
  }

  const datastoreKey = datastore.key({
    path: ["ExecutionLog", id]
  });

  datastore.get(datastoreKey, (err, entity) => {
    if (err) {
      console.warn("Failed to fetch an entity to update.", JSON.stringify(err));
      res.status(500).end();
      return;
    }

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
        if (err) {
          console.error(
            "Failed to update a datastore entity.",
            JSON.stringify(err),
            JSON.stringify(data)
          );
          withCors(res)
            .status(500)
            .end();
        } else {
          withCors(res)
            .status(200)
            .end();
        }
      }
    );
  });
};
