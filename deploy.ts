import { $ } from 'bun';

await $`bun --bun frontend build`;

console.log('Build complete, transferring files...');

await $`scp -r ./frontend/build pi@pi.local:~/splendor/frontend-copy`;
await $`scp ./frontend/.env.production pi@pi.local:~/splendor/frontend-copy/.env`;

await $`ssh pi@pi.local "rm -r ~/splendor/frontend && mv ~/splendor/frontend-copy ~/splendor/frontend"`;

await $`ssh pi@pi.local "cd ~/splendor/frontend && ~/.bun/bin/bun i && sudo systemctl restart splendor-frontend"`;

console.log('Done!');
