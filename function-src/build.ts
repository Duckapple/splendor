import Bun from "bun";

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
const pkgJson = Bun.file("./package.json");

async function buildFunction(functionName: string) {
  await Bun.build({
    entrypoints: [`./${functionName}.ts`],
    outdir: `../out/${functionName}`,
    naming,
    external,
    minify,
    target: "node",
  });
  await Bun.write(`../out/${functionName}/package.json`, pkgJson);
}

await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "../function",
  external,
  minify,
});

// prettier-ignore
await Promise.all([
  buildFunction("register"),
  buildFunction("log-in"),
  buildFunction("game"),
]);

console.log("Built successfully!");
