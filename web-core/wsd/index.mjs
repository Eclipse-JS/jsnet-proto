const relayList = ["ws://127.0.0.1:1280"];

export function register(netAPI) {
  const whenConnected = () => {};
  const whenListened = () => {};

  netAPI.core.addNetworkDevice("relay0", 1, 0, 0, [1], whenConnected, whenListened);
}