export class RedirectError extends Error {
	constructor(public status: 301 | 302 | 303 | 307 | 308 | undefined, public location: string) {
		super();
	}
}
