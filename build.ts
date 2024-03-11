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
	const x = await Bun.build({
		entrypoints: [`./function-src/${functionName}.ts`],
		outdir: `./out/${functionName}`,
		naming,
		external,
		minify,
		target: 'node',
	});
	await Bun.write(`./out/${functionName}/package.json`, pkgJson);
	console.log('Built', functionName);
	const hash = Bun.hash(await Bun.file(x.outputs[0].path).arrayBuffer());
	return [functionName, hash.toString()] as const;
}

await Bun.build({
	entrypoints: ['./function-src/index.ts'],
	outdir: './function',
	external,
	minify,
});

const functions = ['register', 'log-in', 'game', 'room', 'action'] as const;
type Funcs = (typeof functions)[number];

const versions = Object.fromEntries(await Promise.all(functions.map(buildFunction))) as Record<
	Funcs,
	string
>;

console.log('All built successfully!');

const oldVersions = await Bun.file('./VERSION')
	.json()
	.catch(() => ({}));

Bun.write('./VERSION', JSON.stringify(versions, null, 2));

if (!Bun.argv.includes('deploy')) process.exit(0);

const deployFunctions = functions.filter((func) => versions[func] !== oldVersions[func]);

if (deployFunctions.length === 0) {
	console.log('No functions have changed, skipping deploy');
	process.exit(0);
}

console.log('Deploying to:', deployFunctions.join(', '));

async function deploy(functionName: string) {
	await Bun.$`gcloud functions deploy ${functionName} --region=europe-west3 --trigger-http --runtime=nodejs20 --source=out/${functionName} --allow-unauthenticated --gen2 --env-vars-file .env.yaml`.quiet();
	console.log('Deployed', functionName);
}

await Promise.all(deployFunctions.map(deploy));

console.log('All deployed successfully!');
