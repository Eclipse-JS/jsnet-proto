import { netAPI } from "./net/index.mjs";
import { register } from "./wsd/index.mjs";

await register(netAPI);
console.log(netAPI.core.getNetworkDevices());

const dev = netAPI.core.getNetworkDevices().find((i) => i.name == "relay0");
const serverJam = await netAPI.connect("1.0.0." + dev.hostIDs[0], 8000);

const server = await netAPI.listen("127.0.0.1", 8000);
server.on("connection", function(client) {  
  client.on("message", function(msg) {
    console.log(msg);

    client.send("hello: " + msg);
  });
});

const client = await netAPI.connect("127.0.0.1", 8000);
client.on("message", function(msg) {
  console.log("hello(2): " + msg);
});

// Test to see if loopback handles multiple clients correctly
// As in, does the server send back multiple clients data?
const client1 = await netAPI.connect("127.0.0.1", 8000);
client1.on("message", function(msg) {
  console.log("hello(4): " + msg);
})

client.send("owo");