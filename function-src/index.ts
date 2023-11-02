import { http } from "@google-cloud/functions-framework";
import { Datastore } from "@google-cloud/datastore";

import { newGameState } from "../common/defaults";

const ds = new Datastore();

http("splendor-test", async (req, res) => {
  const kind = "Splendor Game State";

  const name = req.query.name?.toString() || "default";

  // The Cloud Datastore key for the new entity
  const key = ds.key([kind, name]);

  // const existing = await ds.get(key);
  // console.log(existing);

  const state = newGameState(2);

  const task = {
    key,
    data: {
      state: JSON.stringify(state),
    },
  };

  // Saves the entity
  const x = await ds.save(task);
  res.send(
    `<p>Saved ${name}<p>\n<pre>${JSON.stringify(x, null, 2)}\n${JSON.stringify(
      state,
      null,
      2
    )}</pre>`
  );
});
