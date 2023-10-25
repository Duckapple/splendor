await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "../function",
  external: ["@google-cloud/functions-framework"],
  minify: true,
});
