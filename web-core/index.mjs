import { netAPI } from "./net/index.mjs";

const server = netAPI.listen("127.0.0.1", 8000);
server.on("connection", function(client) {  
  client.on("message", function(msg) {
    console.log(msg);

    client.send("hello: " + msg);
  });
});

const client = netAPI.connect("127.0.0.1", 8000);
client.on("message", function(msg) {
  console.log("hello(2): " + msg);
});

// Test to see if loopback handles multiple clients correctly
// As in, does the server send back multiple clients data?
const client1 = netAPI.connect("127.0.0.1", 8000);
client1.on("message", function(msg) {
  console.log("hello(4): " + msg);
})

client.send("owo");