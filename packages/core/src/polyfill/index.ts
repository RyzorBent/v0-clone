console.log("running polyfill");

import { neonConfig } from "@neondatabase/serverless";
import { WebSocket } from "ws";

neonConfig.webSocketConstructor = WebSocket;

export {};
