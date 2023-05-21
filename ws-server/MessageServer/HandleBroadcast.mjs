export function handleBroadcast(ws, clients) {
  const conf = ws.clientConfig;

  return function(msg) {
    switch (conf.mode) {
      case "connect": {
        if (msg.type == "sentMessageListen" && msg.intendRecv == conf.targetIP && msg.config.port == conf.port) {
          ws.send(msg.data);
        }

        break;
      }
  
      case "listen": {
        if (msg.config.host != conf.targetIP || msg.config.port != conf.port) return;

        if (msg.type == "connection") {
          ws.send(JSON.stringify({
            type: "connection",
            ip: msg.config.targetIP
          }));
        } else if (msg.type == "disconnection") {
          ws.send(JSON.stringify({
            type: "disconnection",
            ip: msg.config.targetIP
          }));
        } else if (msg.type == "sentMessageClient") {
          ws.send(JSON.stringify({
            type: "message",
            data: msg.data.toString(),
            ip: msg.config.targetIP
          }));
        }

        break;
      }
    }
  }
}