// import Bun from 'bun';
import { object, parse, string } from 'valibot';

// const file = Bun.file('./.env.yaml');

// const text = await file.text();

// // Thx Google for letting us bother with yaml env files, I suppose this parser will do
// const rawEnv = Object.fromEntries(
// 	text.split('\n').map((x) => x.split(': ').map((val) => val.replaceAll(/['"]/g, '')))
// );

const envSchema = object({
	DATABASE_URL: string(),
	DATABASE_FILE: string(),
});

export const env = parse(envSchema, process.env);
