/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// @ts-check

import { build, files, version } from '$service-worker';
import { get } from 'svelte/store';
import { client, jwt } from './lib/main';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

/**
 * @param {string} base64
 * @returns {Uint8Array}
 */
function urlB64ToUint8Array(base64) {
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

sw.addEventListener('install', (event) => {
	const installEvent = /** @type {ExtendableEvent} */ (event);
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	installEvent.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	const activateEvent = /** @type {ExtendableEvent} */ (event);
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	activateEvent.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
	const fetchEvent = /** @type {FetchEvent} */ (event);
	// ignore POST requests etc
	if (fetchEvent.request.method !== 'GET') return;

	/** @returns {Promise<Response>} */
	async function respond() {
		const url = new URL(fetchEvent.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			return /** @type {Promise<Response>} */ (cache.match(url.pathname));
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(fetchEvent.request);

			if (response.status === 200 && !fetchEvent.request.url.includes('chrome-extension://')) {
				cache.put(fetchEvent.request, response.clone());
			}

			return response;
		} catch {
			return /** @type {Promise<Response>} */ (cache.match(fetchEvent.request));
		}
	}

	fetchEvent.respondWith(respond());
});

sw.addEventListener('push', async (e) => {
	const canNotify = await sw.navigator.permissions.query({ name: 'notifications' });

	if (canNotify.state === 'granted') {
		sw.registration.showNotification(e.data?.text() ?? 'no text lol', {});
	} else {
		console.error('Received push when disallowed', e.data?.text());
	}
});

const publicKey = urlB64ToUint8Array(
	'BNRsMC5kgbxxk77s+DIigDX4+4PQZSEIaR4mCXXWkH5aNfyrqEGPUKwaglZNBPHAk+JB0O+RB6w/bHrMbv5XxSY='
);

const channel = new BroadcastChannel('service-worker');
channel.addEventListener('message', async () => {
	try {
		const options = {
			applicationServerKey: publicKey,
			userVisibleOnly: true,
		};
		const subscription = /** @type {*} */ (await sw.registration.pushManager.subscribe(options));
		const response = await client.notifications.index.post(subscription, {
			headers: { Authorization: `Bearer ${get(jwt)}` },
		});
		console.log(response);
	} catch (err) {
		console.log('Error', err);
	}
});

sw.skipWaiting();
