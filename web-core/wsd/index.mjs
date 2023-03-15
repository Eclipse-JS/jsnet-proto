const relayList = ["ws://127.0.0.1:1281"];

import { enCPConfig } from "./validateServer.mjs";

export async function register(netAPI) {
  for (const relayIndex in relayList) {
    const relay = relayList[relayIndex];

    const conf = await enCPConfig(relay);

    const whenConnected = () => {};
    const whenListened = () => {};

    netAPI.core.addNetworkDevice("relay0", parseInt(relayIndex)+1, 0, 0, [conf.ip], whenConnected, whenListened);
  }
}