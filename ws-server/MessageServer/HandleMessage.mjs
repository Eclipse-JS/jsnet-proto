import { canBeParsedAsJSON } from "../libs/CanBeParsed.mjs";

export function handleMessaage(data, ws, clients, broadcastMsg) {
  const conf = ws.clientConfig;
  
  switch (conf.mode) {
    case "connect": {
      broadcastMsg({
        type: "sentMessageClient",
        data: data,
        config: conf
      })

      break;
    }

    case "listen": {
      if (!canBeParsedAsJSON(data)) {
        ws.send(JSON.stringify({
          success: false,
          error: "Data unable to be parsed as JSON.",
        }));

        break;
      }

      const msg = JSON.parse(data);

      switch (msg.type) {
        default: {
          ws.send(
            JSON.stringify({
              success: false,
              error: "Invalid type specified",
            })
          );

          break;
        }
        
        case "send": {
          if (!msg.host) {
            ws.send(JSON.stringify({
              success: false,
              error: "Missing host"
            }));

            break;
          } else if (!msg.data) {
            ws.send(JSON.stringify({
              success: false,
              error: "Missing message"
            }));

            break;
          }

          broadcastMsg({
            type: "sentMessageListen",
            data: msg.data,
            intendRecv: msg.host, 
            config: conf
          });

          break;
        }
      }

      break;
    }
  }
}