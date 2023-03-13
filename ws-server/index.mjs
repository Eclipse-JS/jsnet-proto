import express from "express";
import { WebSocketServer } from "ws";

import { createServer } from "http";
import { readFile } from "fs/promises";

const config = JSON.parse(await readFile("./config.json"));

const clients = [];
const reserveIPs = [];

const app = express();
const server = createServer(app);

app.use(express.json());

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

app.get("/api/v1/getClientList", function(req, res) {
  res.send({
    success: true,
    data: clients // TODO: sanitize(?)
  })
});

app.post("/api/v1/reserveClientIP", function(req, res) {
  const targetPass = getRandomArbitrary(10000000, 99999999);
  let targetIP = getRandomArbitrary(1, 255);

  while (reserveIPs.find((i) => i.ip == targetIP)) {
    targetIP = getRandomArbitrary(1, 255);
  }

  reserveIPs.push({
    targetIP,
    targetPass
  });

  res.send({
    success: true,
    pass: targetPass
  });
});

const wss = new WebSocketServer({
  server: server,
  path: "/ws"
});

server.listen(config.port ? config.port : 1280);
console.log("Listening on %s", config.port ? config.port : 1280);