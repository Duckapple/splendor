await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "../function",
  external: ["@google-cloud/functions-framework", "@google-cloud/datastore"],
  minify: true,
});
