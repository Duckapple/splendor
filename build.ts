import Bun from "bun";

const versions = await Bun.file("./VERSION").json();

const minify = true;
const naming = "[dir]/index.[ext]";
const external = [
  "@google-cloud/functions-framework",
  "@google-cloud/datastore",
  "web-push",
  "@planetscale/database",
  "crypto",
  "jsonwebtoken",
  "bcrypt",
];
const pkgJson = Bun.file("./function-src/package.json");

async function buildFunction<T extends string>(functionName: T) {
  const res = await Bun.build({
    entrypoints: [`./function-src/${functionName}.ts`],
    outdir: `./out/${functionName}`,
    naming,
    external,
    minify,
    target: "node",
  });
  await Bun.write(`./out/${functionName}/package.json`, pkgJson);
  const hash = res.outputs[0].hash;
  const oldData = versions[functionName];
  const version =
    oldData?.hash === hash
      ? oldData?.version ?? 0
      : (oldData?.version ?? 0) + 1;
  return [functionName, { hash, version }] as const;
}

await Bun.build({
  entrypoints: ["./function-src/index.ts"],
  outdir: "./function",
  external,
  minify,
});

const functions = ["register", "log-in", "game"] as const;

// prettier-ignore
const outputs = await Promise.all(functions.map(f => buildFunction(f)));

const newVersions = Object.fromEntries(outputs) as {
  [T in (typeof functions)[number]]: { hash: string; version: any };
};

await Bun.write(Bun.file("./VERSION"), JSON.stringify(newVersions, null, 2));

console.log("Built successfully!");

if (!Bun.argv.includes("deploy")) process.exit(0);

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

for (const fun of ["register", "log-in", "game"] as const) {
  if (newVersions[fun].version === versions[fun].version) continue;
  console.log("Deploying", fun);
  deploy(fun);
}

console.log("All deployed!");
