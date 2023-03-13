export function loadLoopback(netAPI) {
  const itemTable = [];

  function whenConnected(hostID, port) {
    console.log("whenConnect(%s, %s) called", hostID, port);
    const item = itemTable.find((i) => i.port == port);
    
    if (!item) {
      throw new Error("Not listening on port " + port);
    }

    const allListenerFuncArr = [];
    const connectedFuncArr = [];

    for (const listener of item.listeners) {
      if (listener.evtType != "connection") continue;

      listener.function({
        on(type, func) {
          if (type == "message") {
            allListenerFuncArr.push(func);
          }
        },
        send(msg) {
          for (const listener of connectedFuncArr) {
            try {
              listener(msg);
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    }

    function sendAllListeners(msg) {
      for (const listener of allListenerFuncArr) {
        try {
          listener(msg);
        } catch (e) {
          console.error(e);
        }
      }
    }

    return {
      on(type, func) {
        if (type == "message") {
          connectedFuncArr.push(func);
        }
      },

      send(msg) {
        sendAllListeners(msg);
      }
    }
  }

  function whenListened(hostID, port) {
    console.log("whenListened(%s, %s) called", hostID, port);
    const itemFoundCheck = itemTable.find((i) => i.port == port);
    
    if (itemFoundCheck) {
      throw new Error("Already listening on port " + port);
    }
    
    const item = {
      port: port,
      listeners: []
    };
    itemTable.push(item);

    function sync() {
      itemTable.splice(itemTable.indexOf(itemTable.find((i) => i.port == port)), 1, item);
    }

    return {
      on(type, func) {
        if (type == "connection") {
          item.listeners.push({
            evtType: "connection",
            function: func
          });

          sync();
        }
      }
    }
  }

  netAPI.core.addNetworkDevice("lo", 127, 0, 0, [1], whenConnected, whenListened);
}