import { browser } from '$app/environment';
import { PUBLIC_WS_PORT } from '$env/static/public';
import { app as wsApp } from '../../wss';

if (!browser) wsApp.listen(PUBLIC_WS_PORT);
