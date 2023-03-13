import express from "express";
import { WebSocketServer } from "ws";

import { createServer } from "http";
import { readFile } from "fs/promises";

const config = JSON.parse(await readFile("./config.json"));

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({
  server: server,
  path: "/ws"
});

server.listen(config.port ? config.port : 1280);
console.log("Listening on %s", config.port ? config.port : 1280);