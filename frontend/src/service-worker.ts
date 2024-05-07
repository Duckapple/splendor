/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// @ts-check

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

function urlB64ToUint8Array(base64: string) {
	const rawData = sw.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files, // everything in `static`
];

sw.addEventListener('install', (event: ExtendableEvent) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event: FetchEvent) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond(): Promise<Response> {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			return cache.match(url.pathname) as Promise<Response>;
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			return cache.match(event.request) as Promise<Response>;
		}
	}

	event.respondWith(respond());
});

sw.addEventListener('push', async (e) => {
	const canNotify = await sw.navigator.permissions.query({ name: 'notifications' });

	if (canNotify.state === 'granted') {
		sw.registration.showNotification(e.data?.text() ?? 'no text lol', {
			requireInteraction: true,
		});
	} else {
		console.log(e.data?.text());
	}
});

const publicKey = urlB64ToUint8Array(
	'BNRsMC5kgbxxk77s+DIigDX4+4PQZSEIaR4mCXXWkH5aNfyrqEGPUKwaglZNBPHAk+JB0O+RB6w/bHrMbv5XxSY='
);

// saveSubscription saves the subscription to the backend
const saveSubscription = async (subscription: PushSubscription) => {
	const SERVER_URL = 'http://localhost:4000/save-subscription';
	const response = await fetch(SERVER_URL, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(subscription),
	});
	return response.json();
};

self.addEventListener('activate', async () => {
	// This will be called only once when the service worker is activated.
	try {
		const options = {
			applicationServerKey: publicKey,
			userVisibleOnly: true,
		};
		const subscription = await sw.registration.pushManager.subscribe(options);
		const response = await saveSubscription(subscription);
		console.log(response);
	} catch (err) {
		console.log('Error', err);
	}
});
