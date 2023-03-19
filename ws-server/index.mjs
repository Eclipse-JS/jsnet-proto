/**
 * README (client in clients):
 * host: Used for clients connecting to a server
 * targetIP: Used for both server and clients to keep track of own IP
 * 
 * port: Port to listen on
 */

import express from "express";
import cors from "cors";

import { WebSocketServer } from "ws";

import { createServer } from "http";
import { readFile } from "fs/promises";

import { handleMessaage } from "./MessageServer/HandleMessage.mjs";
import { handleBroadcast } from "./MessageServer/HandleBroadcast.mjs";

import { canBeParsedAsJSON } from "./libs/CanBeParsed.mjs";
import { getRandomArbitrary } from "./libs/GetRandomArbitraryNumber.mjs";

const config = JSON.parse(await readFile("./config.json"));

const clients = [];
const reserveIPs = [];

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors());

function broadcastMsg(msg) {
  for (const client of clients) {
    client.handler(msg);
  }
}

app.get("/api/v1/getClientList", function (req, res) {
  res.send({
    success: true,
    data: clients.map((i) => i.targetIP),
  });
});

app.post("/api/v1/reserveClientIP", function (req, res) {
  const targetPass = getRandomArbitrary(10000000, 99999999);
  let targetIP = Math.floor(getRandomArbitrary(1, 255));

  while (reserveIPs.find((i) => i.ip == targetIP)) {
    targetIP = Math.floor(getRandomArbitrary(1, 255));
  }

  reserveIPs.push({
    targetIP,
    targetPass,
  });

  res.send({
    success: true,
    pass: targetPass,
    ip: targetIP,
  });
});

const wss = new WebSocketServer({
  server: server,
  path: "/ws",
});

wss.on("connection", function (ws) {
  ws.clientConfig = {}; // Client configuration data (ex. IP data)

  ws.on("close", function() {
    if (ws.clientConfig.allDataPassed) {
      broadcastMsg({
        type: "disconnection",
        config: ws.clientConfig
      })
    }
  })

  ws.on("message", function (msg) {
    if (ws.clientConfig.allDataPassed) return handleMessaage(msg, ws, clients, broadcastMsg);

    if (!canBeParsedAsJSON(msg)) {
      return ws.send(
        JSON.stringify({
          success: false,
          error: "Data unable to be parsed as JSON.",
        })
      );
    }

    const data = JSON.parse(msg);

    if (!ws.clientConfig.targetPass) {
      // Check if we have the password for the account
      if (data.type != "authenticate") {
        return ws.send(
          JSON.stringify({
            success: false,
            error: "Not authenticated.",
          })
        );
      }

      const item = reserveIPs.find((i) => i.targetPass == data.pass);

      if (!item) {
        return ws.send(
          JSON.stringify({
            success: false,
            error: "Invalid password.",
          })
        );
      }

      ws.clientConfig = Object.create(item);

      return ws.send(
        JSON.stringify({
          success: true,
        })
      );
    }

    switch (data.type) {
      default: {
        return ws.send(
          JSON.stringify({
            success: false,
            error: "Invalid type specified",
          })
        );
      }

      case "getSysConfigInfo": {
        return ws.send(
          JSON.stringify({
            success: true,
            data: ws.clientConfig,
          })
        );
      }

      case "listen": {
        if (!data.port)
          return ws.send(
            JSON.stringify({
              success: false,
              error: "Missing port",
            })
          );

        if (data.port <= 0 || data.port > 65535)
          return ws.send(
            JSON.stringify({
              success: false,
              error: "Port out of range",
            })
          );

        ws.clientConfig.mode = "listen";
        ws.clientConfig.port = data.port;

        ws.clientConfig.allDataPassed = true;

        ws.send(
          JSON.stringify({
            success: true,
            message: "Switched modes from Console to Listen",
          })
        );

        clients.push({
          ...ws.clientConfig,
          handler: handleBroadcast(ws, clients, broadcastMsg)
        })

        return;
      }

      case "connect": {
        if (!data.port)
          return ws.send(
            JSON.stringify({
              success: false,
              error: "Missing port",
            })
          );

        if (!data.hostID)
          return ws.send(
            JSON.stringify({
              success: false,
              error: "Missing host ID",
            })
          );

        if (data.port <= 0 || data.port > 65535)
          return ws.send(
            JSON.stringify({
              success: false,
              error: "Port out of range",
            })
          );

        if (data.hostID <= 0 || data.hostID > 255)
          return ws.send(
            JSON.stringify({
              success: false,
              error: "Host ID out of range",
            })
          );

        ws.clientConfig.mode = "connect";
        ws.clientConfig.port = data.port;
        ws.clientConfig.host = data.hostID;

        ws.clientConfig.allDataPassed = true;

        ws.send(
          JSON.stringify({
            success: true,
            message: "Switched modes from Console to Connect",
          })
        );
        
        clients.push({
          ...ws.clientConfig,
          handler: handleBroadcast(ws, clients)
        });

        broadcastMsg({
          type: "connection",
          config: ws.clientConfig
        })

        return;
      }
    }
  });
});

server.listen(config.port ? config.port : 1280);
console.log("Listening on %s", config.port ? config.port : 1280);
