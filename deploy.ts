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

await Promise.all([
	$`scp ./.env pi@pi.local:~/splendor/.env`,
	$`scp ./function/index.js pi@pi.local:~/splendor/index.js`,
	$`scp -r ./frontend/build pi@pi.local:~/splendor/frontend-copy`,
]);

await $`scp ./frontend/.env.production pi@pi.local:~/splendor/frontend-copy/.env`;

await $`ssh pi@pi.local "rm -r ~/splendor/frontend && mv ~/splendor/frontend-copy ~/splendor/frontend"`;

await $`ssh pi@pi.local "cd ~/splendor/frontend && ~/.bun/bin/bun i && sudo systemctl restart splendor-frontend && sudo systemctl restart splendor"`;

console.log('Done!');
