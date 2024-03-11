import Bun from 'bun';

console.log('Built at', new Date());

const minify = true;
const naming = '[dir]/index.[ext]';
const external = [
	'@google-cloud/functions-framework',
	'web-push',
	'crypto',
	'jsonwebtoken',
	'bcrypt',
];
const pkgJson = Bun.file('./function-src/package.json');

async function buildFunction<T extends string>(functionName: T) {
	await Bun.build({
		entrypoints: [`./function-src/${functionName}.ts`],
		outdir: `./out/${functionName}`,
		naming,
		external,
		minify,
		target: 'node',
	});
	await Bun.write(`./out/${functionName}/package.json`, pkgJson);
	console.log('Built', functionName);
	return functionName;
}

await Bun.build({
	entrypoints: ['./function-src/index.ts'],
	outdir: './function',
	external,
	minify,
});

const functions = ['register', 'log-in', 'game', 'room', 'action'] as const;

await Promise.all(functions.map(buildFunction));

console.log('All built successfully!');

if (!Bun.argv.includes('deploy')) process.exit(0);

console.log('Deploying to:', functions.join(', '));

async function deploy(functionName: string) {
	await Bun.$`gcloud functions deploy ${functionName} --region=europe-west3 --trigger-http --runtime=nodejs20 --source=out/${functionName} --allow-unauthenticated --gen2 --env-vars-file .env.yaml`.quiet();
	console.log('Deployed', functionName);
}

await Promise.all(functions.map(deploy));

console.log('All deployed successfully!');
