const relayList = ["ws://127.0.0.1:1281"];

import { enCPConfig } from "./validateServer.mjs";

export async function register(netAPI) {
  for (const relayIndex in relayList) {
    const relay = relayList[relayIndex];
    const conf = await enCPConfig(relay);

    function whenConnected(hostID, port) {
      const msgBuffer = [];

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

        if (handleState == "auth") {
          if (!data.success) throw new Error("Failed authentication [INTERNAL] (" + data.error + ")");
          handleState = "configClient";

          ws.send(JSON.stringify({
            type: "connect",
            port,
            hostID
          }));
        } else if (handleState == "configClient") {
          if (!data.success) throw new Error("Failed to connect to server");
          handleState = "messageControl";

          for (const i of msgBuffer) ws.send(i);
        }

        if (!data.success) {
          throw new Error("UNREACHABLE, Error firing: " + data.error);
        }
      });

      ws.addEventListener("open", function(e) {
        ws.send(JSON.stringify({
          type: "authenticate",
          pass: conf.pass
        }));
      });

      function bufferedSendWS(msg) {
        if (handleState != "messageControl") return msgBuffer.push(msg);

        ws.send(msg);
      }

      return {
        on(type, func) {
          if (type == "message") connectedFuncArr.push(func);
        },
  
        send: (msg) => bufferedSendWS(msg),
        close: () => ws.close()
      }
    }

    function whenListened(hostID, port) {
      const internalOnMessageDispatcher = [];
      const onConnectionFuncArr = [];
      let handleState = "auth";

      const ws = new WebSocket(relay + "/ws");
      ws.addEventListener("message", function(e) {
        const data = JSON.parse(e.data);

        if (handleState == "messageControl") {
          if (data.type == "connection") {
            for (const connListener of onConnectionFuncArr) {
              try {
                connListener({
                  on(type, func) {
                    if (type == "message") {
                      internalOnMessageDispatcher.push({
                        ip: data.ip,
                        func: func
                      })
                    }
                  },
                  send(msg) {
                    ws.send(JSON.stringify({
                      type: "send",
                      host: data.ip,
                      data: msg
                    }));
                  }
                })
              } catch (e) {
                console.error(e);
              }
            }
          } else if (data.type == "message") {
            for (const i of internalOnMessageDispatcher) {
              if (i.host == data.ip) {
                try {
                  i.func(data);
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }
          return;
        }

        if (handleState == "auth") {
          if (!data.success) throw new Error("1Failed authentication [INTERNAL] (" + data.error + ")");
          handleState = "configClient";

          ws.send(JSON.stringify({
            type: "listen",
            port
          }));
        } else if (handleState == "configClient") {
          if (!data.success) throw new Error("Failed to connect to server"); 

          handleState = "messageControl";
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
          if (type == "connection") onConnectionFuncArr.push(func);
        },
        close: () => ws.close()
      }
    }

    netAPI.core.addNetworkDevice("relay" + relayIndex, parseInt(relayIndex)+1, 0, 0, [conf.ip], whenConnected, whenListened);
  }
}