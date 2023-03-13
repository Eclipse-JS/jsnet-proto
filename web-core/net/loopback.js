/**
 * Allocates an array with specified size
 * @param {number} num Number to allocate of array indexes
 * @returns {array} Array with each element being the current array length at that element
 */
function array_alloc(num) {
  const arr = [];

  for (var i = 1; i < num+1; i++) {
    arr.push(i);
  }

  return arr;
}

/**
 * Loads loopback connection
 * @param {object} netAPI Network API object
 */
export function loadLoopback(netAPI) {
  const itemTable = []; // Stores client data, not used much

  /**
   * Event called by NetAPI when a connection request has been recieved
   * @param {number} hostID ID of the host on the network connection
   * @param {number} port Port to listen on
   * @returns {object} Object to let you interface with the server
   */
  function whenConnected(hostID, port) {
    const item = itemTable.find((i) => i.hostID == hostID && i.port == port); // Check to see if you are listening on a port 
    
    if (!item) {
      throw new Error("Not listening on port " + port);
    }

    const allListenerFuncArr = []; // All listeners from the server
    const connectedFuncArr = []; // All listeners from the client

    for (const listener of item.listeners) {
      if (listener.evtType != "connection") continue;

      listener.function({
        on(type, func) {
          if (type == "message") {
            // Pushes the message listener to the server listener list
            allListenerFuncArr.push(func);
          }
        },
        send(msg) {
          // Iterates over all the listeners from the client, and sends a message to each of them 
          for (const listener of connectedFuncArr) {
            try {
              listener(netAPI.helperInternal.sanitizeIPMsg(msg));
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    }

    return {
      on(type, func) {
        if (type == "message") {
          // Pushes the message listener to the client listener list
          connectedFuncArr.push(func);
        }
      },

      send(msg) {
        // Iterates over all the listeners from the server, and sends a message to each of them 
        for (const listener of allListenerFuncArr) {
          try {
            listener(netAPI.helperInternal.sanitizeIPMsg(msg));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }

  /**
   * Event called by NetAPI when you listen on a port
   * @param {number} hostID ID of the host on the network connection
   * @param {number} port Port to listen on 
   * @returns {object} Server object
   */
  function whenListened(hostID, port) {
    const itemFoundCheck = itemTable.find((i) => i.port == port); // Check to see if you are already listening on a port 
    
    if (itemFoundCheck) {
      throw new Error("Already listening on port " + port);
    }
    
    const item = {
      port: port,
      hostID: hostID,
      listeners: []
    };
    itemTable.push(item);

    /**
     * Syncs the items of the item table
     */
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

  // Adds a network device via NetAPI
  netAPI.core.addNetworkDevice("lo", 127, 0, 0, array_alloc(255), whenConnected, whenListened);
}