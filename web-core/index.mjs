import { netAPI } from "./net/index.mjs";
import { register } from "./wsd/index.mjs";

await register(netAPI);
console.log(netAPI.core.getNetworkDevices());

const dev = netAPI.core.getNetworkDevices().find((i) => i.name == "relay0");
const server = await netAPI.listen("1.0.0." + dev.hostIDs[0], 1025);
server.on("connection", function(client) {
  console.log("ARGVGGz")
  client.send(":)");
  client.on("message", function(msg) {
    console.log(msg);
  });
});

const client = await netAPI.connect("1.0.0." + dev.hostIDs[0], 1025);
client.on("message", function(msg) {
  console.log(msg);
});

client.send("owo");