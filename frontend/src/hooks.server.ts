import { browser } from '$app/environment';
import { PUBLIC_WS_PORT } from '$env/static/public';
import { app as wsApp } from '../../wss';

// console.log(PUBLIC_WS_PORT);
// (globalThis as unknown as { websocketEdenApp: any }).websocketEdenApp =
if (!browser) wsApp.listen(PUBLIC_WS_PORT, console.log);
