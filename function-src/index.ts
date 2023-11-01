import { http } from "@google-cloud/functions-framework";
import { Datastore } from "@google-cloud/datastore";

const ds = new Datastore();

http("splendor-test", async (req, res) => {
  // The kind for the new entity
  const kind = "Splendor Game State";

  // The name/ID for the new entity
  const name = req.query.name?.toString() || "default";

  // The Cloud Datastore key for the new entity
  const taskKey = ds.key([kind, name]);

  // Prepares the new entity
  const task = {
    key: taskKey,
    data: {
      description: "Buy milk",
    },
  };

  // Saves the entity
  const x = await ds.save(task);
  res.send(`Saved ${name}`);
});
