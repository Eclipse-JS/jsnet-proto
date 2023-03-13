export function loadLoopback(netAPI) {
  const itemTable = [];

  function whenConnected(hostID, port) {
    console.log("whenConnect(%s, %s) called", hostID, port);

    return {
      on: function(type) {

      },
      send: function(msg) {
        
      }
    }
  }

  function whenListened(hostID, port) {
    console.log("whenListened(%s, %s) called", hostID, port);

    return {
      on: function(type) {

      },
      send: function(msg) {

      }
    }
  }

  netAPI.core.addNetworkDevice("lo", 127, 0, 0, [1], whenConnected, whenListened);
}