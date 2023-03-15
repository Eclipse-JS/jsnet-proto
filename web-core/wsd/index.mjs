const relayList = ["ws://127.0.0.1:1281"];

import { enCPConfig } from "./validateServer.mjs";

export async function register(netAPI) {
  for (const relayIndex in relayList) {
    const relay = relayList[relayIndex];
    const conf = await enCPConfig(relay);

    function whenConnected(hostID, port) {
      const connectedFuncArr = [];
      let handleState = "auth";

      const ws = new WebSocket(relay + "/ws");
      ws.addEventListener("message", function(e) {
        if (handleState == "messageControl") {
          for (const i of connectedFuncArr) {
            try {
              i(e.data);
            } catch (e) {
              console.error(e);
            }
          }

          return;
        }

        const data = JSON.parse(e.data);
        console.log(data);

        if (handleState == "auth") {
          if (!data.success) throw "Failed authentication";

          ws.send(JSON.stringify({
            type: "connect",
            port,
            hostID
          }));
        } else if (handleState == "configClient") {
          if (!data.success) throw "Failed to connect to server";
          handleState = "messageControl";
        }

        if (!data.success) {
          throw new Error(data.error);
        }
      });

      ws.addEventListener("open", function(e) {
        ws.send(JSON.stringify({
          type: "authenticate",
          pass: conf.pass
        }));
      });

      return {
        on(type, func) {
          if (type == "message") {
            // Pushes the message listener to the client listener list
            connectedFuncArr.push(func);
          }
        },
  
        send(msg) {
          // Iterates over all the listeners from the server, and sends a message to each of them 
          //

          ws.send(msg);
        }
      }
    }

    function whenListened(hostID, port) {

    }

    netAPI.core.addNetworkDevice("relay" + relayIndex, parseInt(relayIndex)+1, 0, 0, [conf.ip], whenConnected, whenListened);
  }
}