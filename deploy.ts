import { $ } from 'bun';

const naming = '[dir]/index.[ext]';
const x = await Bun.build({
	entrypoints: [`./local.ts`],
	outdir: `./function`,
	naming,
	minify: true,
	target: 'bun',
});

await $`bun frontend build`;

console.log('Build complete, transferring files...');

await $`scp ./.env pi@pi.local:~/splendor/.env`;
await $`scp ./function/index.js pi@pi.local:~/splendor/index.js`;

console.log('Done!');
