import express from "express";
import { WebSocketServer } from "ws";

import { createServer } from "http";
import { readFile } from "fs/promises";

import { handleMessaage } from "./MessageServer/index.mjs";

const config = JSON.parse(await readFile("./config.json"));

const clients = [];
const reserveIPs = [];

const app = express();
const server = createServer(app);

app.use(express.json());

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function canBeParsedAsJSON(...data) {
  for (const i in data) {
    try {
      JSON.parse(data);
    } catch (e) {
      return false;
    }
  }

  return true;
}

app.get("/api/v1/getClientList", function (req, res) {
  res.send({
    success: true,
    data: clients, // TODO: sanitize(?)
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

  ws.on("message", function (msg) {
    if (ws.clientConfig.allDataPassed) {
      // Begin message handle
      handleMessaage(msg, ws.clientConfig, clients);
    }

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
      if (data.mode != "authenticate") {
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

      ws.clientConfig = item;

      return ws.send(
        JSON.stringify({
          success: true,
        })
      );
    }

    switch (data.mode) {
      default: {
        return ws.send(
          JSON.stringify({
            success: false,
            error: "Invalid mode specified",
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

        return ws.send(
          JSON.stringify({
            success: true,
            message: "Switched modes from Console to Listen",
          })
        );
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

        if (data.port <= 0 || data.port > 255)
          return ws.send(
            JSON.stringify({
              success: false,
              error: "Host ID out of range",
            })
          );

        ws.clientConfig.allDataPassed = true;

        return ws.send(
          JSON.stringify({
            success: true,
            message: "Switched modes from Console to Connect",
          })
        );
      }
    }
  });
});

server.listen(config.port ? config.port : 1280);
console.log("Listening on %s", config.port ? config.port : 1280);
