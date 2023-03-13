export function loadLoopback(netAPI) {
  const whenConnected = () => {};
  const whenListened = () => {};
  
  netAPI.core.addNetworkDevice("lo", 127, 0, 0, [1], whenConnected, whenListened);
}