# Splendor Frontend

## Developing

To just run the Svelte app in dev mode, use:

```bash
bun run dev
```

But, since service workers have iffy support in dev mode, it might be better to reload manually with:

```bash
bun run build && bun run preview
```

<!-- To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment. -->
