/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// @ts-check

import { build, files, version } from '$service-worker';
import { title } from 'process';
import { client } from './lib/main';

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

const publicKey = urlB64ToUint8Array(
	'BNRsMC5kgbxxk77s+DIigDX4+4PQZSEIaR4mCXXWkH5aNfyrqEGPUKwaglZNBPHAk+JB0O+RB6w/bHrMbv5XxSY='
);

const channel = new BroadcastChannel('service-worker');
channel.addEventListener('message', async (e) => {
	const { type, ...data } = e.data;
	switch (type) {
		case 'notifications': {
			try {
				const options = {
					applicationServerKey: publicKey,
					userVisibleOnly: true,
				};
				const subscription = /** @type {*} */ (
					await sw.registration.pushManager.subscribe(options)
				);
				const response = await client.api.notifications.index.post(subscription, {
					headers: { Authorization: `Bearer ${data.jwt}` },
				});
				channel.postMessage({
					type: 'notifications',
					response: response.data ?? response.error,
					status: response.status,
				});
			} catch (error) {
				channel.postMessage({ type: 'notifications', response: error, status: 500 });
			}
		}
	}
});

sw.addEventListener('push', async (event) => {
	const canNotify = await sw.navigator.permissions.query({ name: 'notifications' });

	/** @type {{ message?: string, type: string, gameId?: string }} */
	const { message, ...rest } = event.data?.json() ?? {};

	if (rest) channel.postMessage(rest);

	if (canNotify.state === 'granted') {
		const oldNotis = await sw.registration.getNotifications();
		oldNotis.forEach((noti) => noti.close());

		const actions = [];
		switch (rest.type) {
			case 'your-turn':
				actions.push({ action: `/game?id=${rest.gameId}`, title: 'View game' });
				break;
			case 'invite':
				actions.push({ action: `/join?id=${rest.gameId}`, title: 'Accept' });
				actions.push({ action: `/decline?id=${rest.gameId}`, title: 'Decline' });
				break;
		}

		event.waitUntil(
			sw.registration.showNotification(message ?? 'Updates are available!', {
				icon: '/favicon.png',
				badge: '/favicon.png',
				tag: rest.type + (rest.gameId ?? ''),
				data: rest,
				actions,
			})
		);
	} else {
		console.error('Received push when disallowed', message);
	}
});

sw.addEventListener(
	'notificationclick',
	(event) => {
		event.notification.close();

		let action = event.action;

		if (!action) {
			switch (event.notification.data.type) {
				case 'your-turn':
					action = `/game?id=${event.notification.data.gameId}`;
					break;
				case 'invite':
					action = `/new?id=${event.notification.data.gameId}`;
					break;
			}
		}

		event.waitUntil(sw.clients.openWindow(event.action));
	},
	false
);

sw.skipWaiting();
