import Bun from "bun";
function deploy(functionName: string) {
  return Bun.spawn({
    cmd: [
      "gcloud",
      "functions",
      "deploy",
      functionName,
      "--region=europe-west3",
      "--trigger-http",
      "--runtime=nodejs20",
      `--source=out/${functionName}`,
      "--allow-unauthenticated",
      "--gen2",
      "--env-vars-file",
      ".env.yaml",
    ],
  });
}

// prettier-ignore
await Promise.all([
    deploy("register"),
    deploy("log-in"),
    deploy("game"),
]);
